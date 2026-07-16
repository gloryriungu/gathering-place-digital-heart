import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const allowedOrigins = [
  'https://tot.co.ke',
  'https://stg.tot.co.ke',
  'http://localhost:5173',
  'https://id-preview--1002bdcc-1ba9-4425-9337-cf483dae12d9.lovable.app',
  'https://1002bdcc-1ba9-4425-9337-cf483dae12d9.lovableproject.com',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') ?? '';
  return {
    'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
  };
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, orderId, accessToken, productId, customerEmail, userId } = await req.json();

    // Action: grant_access - Called after successful payment to create digital purchase record
    if (action === 'grant_access') {
      console.log('Granting digital product access:', { orderId, productId, customerEmail });

      // Get order details
      const { data: order, error: orderError } = await supabaseClient
        .from('shop_orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) {
        console.error('Order not found:', orderError);
        return new Response(
          JSON.stringify({ error: 'Order not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get digital products from order items
      const orderItems = order.items as any[];
      const digitalProducts: any[] = [];

      for (const item of orderItems) {
        const productId = item.product_id || item.id;
        console.log('Looking up product:', productId);
        
        const { data: product } = await supabaseClient
          .from('media_content')
          .select('*')
          .eq('id', productId)
          .single();

        if (product) {
          const contentData = product.content_data as any;
          if (contentData?.is_digital) {
            digitalProducts.push({
              ...product,
              quantity: item.quantity
            });
          }
        }
      }

      // Create digital purchase records for each digital product
      const purchaseRecords = [];
      for (const product of digitalProducts) {
        // Set expiry to 30 days from now
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        // Generate unique access token
        const accessTokenGenerated = crypto.randomUUID();

        const { data: purchase, error: purchaseError } = await supabaseClient
          .from('digital_purchases')
          .insert({
            user_id: order.user_id || userId || null,
            product_id: product.id,
            order_id: orderId,
            customer_email: order.customer_email,
            max_downloads: 5,
            download_expires_at: expiresAt.toISOString(),
            access_token: accessTokenGenerated
          })
          .select()
          .single();

        if (purchaseError) {
          console.error('Failed to create digital purchase:', purchaseError);
        } else {
          purchaseRecords.push({
            ...purchase,
            product_title: product.title,
            file_path: (product.content_data as any)?.digital_file_path
          });
        }
      }

      console.log('Digital access granted for products:', purchaseRecords.length);

      // Send email with download links if there are digital products
      if (purchaseRecords.length > 0 && order.customer_email) {
        try {
          const siteUrl = 'https://stg.tot.co.ke';
          
          // Build product list HTML
          const productListHtml = purchaseRecords.map(purchase => `
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">
                <strong>${purchase.product_title}</strong>
              </td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">
                5 downloads
              </td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">
                30 days
              </td>
            </tr>
          `).join('');

          const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1a1a1a; margin-bottom: 10px;">🎉 Your Digital Purchase is Ready!</h1>
                <p style="color: #666; font-size: 16px;">Thank you for your purchase, ${order.customer_name}!</p>
              </div>
              
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h2 style="color: #1a1a1a; margin-top: 0; font-size: 18px;">Order #${order.order_number}</h2>
                <p style="margin-bottom: 0; color: #666;">Your digital products are now available for download.</p>
              </div>
              
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                  <tr style="background-color: #f0f0f0;">
                    <th style="padding: 12px; text-align: left; font-weight: 600;">Product</th>
                    <th style="padding: 12px; text-align: center; font-weight: 600;">Downloads</th>
                    <th style="padding: 12px; text-align: center; font-weight: 600;">Access</th>
                  </tr>
                </thead>
                <tbody>
                  ${productListHtml}
                </tbody>
              </table>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${siteUrl}/shop/verify?reference=${order.paystack_reference || order.transaction_reference}"
                   style="display: inline-block; background-color: #0070f3; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  Download Your Products
                </a>
              </div>
              
              <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; padding: 15px; margin-bottom: 20px;">
                <p style="margin: 0; color: #856404; font-size: 14px;">
                  <strong>⚠️ Important:</strong> Each product can be downloaded up to 5 times within 30 days of purchase. Please save your files after downloading.
                </p>
              </div>
              
              <div style="border-top: 1px solid #e5e5e5; padding-top: 20px; margin-top: 20px; text-align: center; color: #666; font-size: 14px;">
                <p>If you have any questions about your purchase, please contact our support team.</p>
                <p style="margin-bottom: 0;">Thank you for supporting our ministry!</p>
              </div>
            </body>
            </html>
          `;

          console.log('Sending email to:', order.customer_email);
          const emailResponse = await resend.emails.send({
            from: "TOT Store <info@tot.co.ke>",
            to: [order.customer_email],
            subject: `Your Digital Purchase is Ready - Order #${order.order_number}`,
            html: emailHtml,
          });
          console.log('Resend API response:', JSON.stringify(emailResponse));

          console.log('Email sent successfully:', emailResponse);
        } catch (emailError) {
          console.error('Failed to send email:', emailError);
          // Don't fail the whole request if email fails
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          digital_purchases: purchaseRecords,
          has_digital_products: digitalProducts.length > 0
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: get_download_url - Generate signed URL for downloading
    if (action === 'get_download_url') {
      console.log('Generating download URL:', { accessToken, productId });

      // Get digital purchase record
      const { data: purchase, error: purchaseError } = await supabaseClient
        .from('digital_purchases')
        .select('*, media_content:product_id(*)')
        .eq('access_token', accessToken)
        .single();

      if (purchaseError || !purchase) {
        console.error('Digital purchase not found:', purchaseError);
        return new Response(
          JSON.stringify({ error: 'Access not found or expired' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if download limit reached
      if (purchase.download_count >= purchase.max_downloads) {
        return new Response(
          JSON.stringify({ error: 'Download limit reached' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if access expired
      if (purchase.download_expires_at && new Date(purchase.download_expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ error: 'Download access has expired' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const product = purchase.media_content as any;
      const contentData = product?.content_data as any;
      const filePath = contentData?.digital_file_path;

      if (!filePath) {
        return new Response(
          JSON.stringify({ error: 'Digital file not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate signed URL (valid for 1 hour)
      const { data: signedUrl, error: signedUrlError } = await supabaseClient
        .storage
        .from('digital-products')
        .createSignedUrl(filePath, 3600);

      if (signedUrlError) {
        console.error('Failed to generate signed URL:', signedUrlError);
        return new Response(
          JSON.stringify({ error: 'Failed to generate download link' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Increment download count
      await supabaseClient
        .from('digital_purchases')
        .update({ 
          download_count: purchase.download_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', purchase.id);

      console.log('Download URL generated successfully');

      return new Response(
        JSON.stringify({
          success: true,
          download_url: signedUrl.signedUrl,
          product_title: product.title,
          downloads_remaining: purchase.max_downloads - purchase.download_count - 1,
          expires_at: purchase.download_expires_at
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: download_file - Stream file directly to client (avoids browser blocking)
    if (action === 'download_file') {
      console.log('Downloading file:', { accessToken });

      // Get digital purchase record
      const { data: purchase, error: purchaseError } = await supabaseClient
        .from('digital_purchases')
        .select('*, media_content:product_id(*)')
        .eq('access_token', accessToken)
        .single();

      if (purchaseError || !purchase) {
        console.error('Digital purchase not found:', purchaseError);
        return new Response(
          JSON.stringify({ error: 'Access not found or expired' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if download limit reached
      if (purchase.download_count >= purchase.max_downloads) {
        return new Response(
          JSON.stringify({ error: 'Download limit reached' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if access expired
      if (purchase.download_expires_at && new Date(purchase.download_expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ error: 'Download access has expired' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const product = purchase.media_content as any;
      const contentData = product?.content_data as any;
      const filePath = contentData?.digital_file_path;

      if (!filePath) {
        return new Response(
          JSON.stringify({ error: 'Digital file not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Download the file from storage
      const { data: fileData, error: fileError } = await supabaseClient
        .storage
        .from('digital-products')
        .download(filePath);

      if (fileError || !fileData) {
        console.error('Failed to download file from storage:', fileError);
        return new Response(
          JSON.stringify({ error: 'Failed to download file' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Increment download count
      await supabaseClient
        .from('digital_purchases')
        .update({ 
          download_count: purchase.download_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', purchase.id);

      // Determine filename from path or product title
      const fileExtension = filePath.split('.').pop() || 'pdf';
      const safeTitle = (product.title || 'download').replace(/[^a-zA-Z0-9\s-]/g, '').trim();
      const filename = `${safeTitle}.${fileExtension}`;

      console.log('File download successful:', filename);

      // Return the file as a downloadable response
      return new Response(fileData, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'X-Filename': filename,
          'X-Downloads-Remaining': String(purchase.max_downloads - purchase.download_count - 1),
        }
      });
    }

    // Action: read_file - Stream file for in-browser reading (does NOT count against download limit)
    if (action === 'read_file') {
      console.log('Reading file in-browser:', { accessToken });

      const { data: purchase, error: purchaseError } = await supabaseClient
        .from('digital_purchases')
        .select('*, media_content:product_id(*)')
        .eq('access_token', accessToken)
        .single();

      if (purchaseError || !purchase) {
        console.error('Digital purchase not found:', purchaseError);
        return new Response(
          JSON.stringify({ error: 'Access not found or expired' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if access expired
      if (purchase.download_expires_at && new Date(purchase.download_expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ error: 'Access has expired' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const product = purchase.media_content as any;
      const contentData = product?.content_data as any;
      const filePath = contentData?.digital_file_path;

      if (!filePath) {
        return new Response(
          JSON.stringify({ error: 'Digital file not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: fileData, error: fileError } = await supabaseClient
        .storage
        .from('digital-products')
        .download(filePath);

      if (fileError || !fileData) {
        console.error('Failed to read file from storage:', fileError);
        return new Response(
          JSON.stringify({ error: 'Failed to load file' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('File read successful for in-browser viewing');

      // Return as inline PDF (not attachment) - does NOT increment download count
      return new Response(fileData, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'inline',
        }
      });
    }

    // Action: get_user_downloads - Get all digital purchases for a user
    if (action === 'get_user_downloads') {
      console.log('Getting user downloads:', { customerEmail, userId });

      let query = supabaseClient
        .from('digital_purchases')
        .select('*, media_content:product_id(id, title, description, image_url, content_data)');

      if (userId) {
        query = query.eq('user_id', userId);
      } else if (customerEmail) {
        query = query.eq('customer_email', customerEmail);
      } else {
        return new Response(
          JSON.stringify({ error: 'User ID or email required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: purchases, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch digital purchases:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch downloads' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          downloads: purchases || []
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: get_order_downloads - Get digital purchases for a specific order
    if (action === 'get_order_downloads') {
      console.log('Getting order downloads:', { orderId });

      if (!orderId) {
        return new Response(
          JSON.stringify({ error: 'Order ID required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: purchases, error } = await supabaseClient
        .from('digital_purchases')
        .select('*, media_content:product_id(id, title, description, image_url)')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch order downloads:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch downloads' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          downloads: purchases || []
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in deliver-digital-product:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
    );
  }
});
