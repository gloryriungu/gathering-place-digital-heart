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
    const { reference } = await req.json();

    if (!reference) {
      return new Response(
        JSON.stringify({ error: 'Reference is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify transaction with Paystack
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          'Authorization': `Bearer ${paystackSecretKey}`,
        },
      }
    );

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok || !verifyData.status) {
      console.error('Paystack verification failed:', verifyData);
      return new Response(
        JSON.stringify({ error: 'Payment verification failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get order record
    const { data: order, error: orderFetchError } = await supabaseClient
      .from('shop_orders')
      .select('*')
      .eq('id', reference)
      .single();

    if (orderFetchError) {
      console.error('Order not found:', orderFetchError);
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine transaction status
    const paystackStatus = verifyData.data.status;
    let transactionStatus = 'pending';
    
    if (paystackStatus === 'success') {
      transactionStatus = 'completed';
    } else if (paystackStatus === 'failed') {
      transactionStatus = 'failed';
    }

    // Update order
    const { data: updatedOrder, error: updateError } = await supabaseClient
      .from('shop_orders')
      .update({
        transaction_status: transactionStatus,
        payment_channel: verifyData.data.channel,
        paystack_reference: verifyData.data.reference,
        transaction_reference: verifyData.data.reference,
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update order:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update order status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Order updated successfully:', updatedOrder.id);

    // Grant digital product access if payment successful
    let digitalPurchases = [];
    let hasDigitalProducts = false;
    
    if (transactionStatus === 'completed') {
      try {
        console.log('Calling deliver-digital-product for order:', order.id);
        // Call deliver-digital-product to grant access
        const deliverUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/deliver-digital-product`;
        console.log('Deliver URL:', deliverUrl);
        
        const deliverResponse = await fetch(deliverUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          },
          body: JSON.stringify({
            action: 'grant_access',
            orderId: order.id,
            customerEmail: order.customer_email,
            userId: order.user_id
          })
        });

        console.log('Deliver response status:', deliverResponse.status);
        const deliverData = await deliverResponse.json();
        console.log('Deliver response data:', JSON.stringify(deliverData));
        if (deliverData.success) {
          digitalPurchases = deliverData.digital_purchases || [];
          hasDigitalProducts = deliverData.has_digital_products || false;
          console.log('Digital access granted:', digitalPurchases.length, 'items');
        }
      } catch (deliverError) {
        console.error('Failed to grant digital access:', deliverError);
        // Don't fail the whole request, just log the error
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          status: transactionStatus === 'completed' ? 'success' : 'failed',
          amount: verifyData.data.amount / 100,
          currency: verifyData.data.currency,
          reference: verifyData.data.reference,
          paid_at: verifyData.data.paid_at,
          channel: verifyData.data.channel,
          order: updatedOrder,
          digital_purchases: digitalPurchases,
          has_digital_products: hasDigitalProducts
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in verify-shop-payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
