import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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
        const { data: product } = await supabaseClient
          .from('media_content')
          .select('*')
          .eq('id', item.id)
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

        const { data: purchase, error: purchaseError } = await supabaseClient
          .from('digital_purchases')
          .insert({
            user_id: order.user_id || userId || null,
            product_id: product.id,
            order_id: orderId,
            customer_email: order.customer_email,
            max_downloads: 5,
            download_expires_at: expiresAt.toISOString()
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

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in deliver-digital-product:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
