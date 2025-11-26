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
    const { 
      customer_name,
      customer_email,
      customer_phone,
      items,
      subtotal,
      total_amount,
      user_id
    } = await req.json();

    console.log('Initialize shop payment:', { customer_email, total_amount });

    // Validate inputs
    if (!customer_name || !customer_email || !items || !total_amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (total_amount < 10) {
      return new Response(
        JSON.stringify({ error: 'Minimum order amount is KES 10' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Generate order number
    const { data: orderNumberData, error: orderNumberError } = await supabaseClient
      .rpc('generate_order_number');

    if (orderNumberError) {
      console.error('Error generating order number:', orderNumberError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate order number' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const orderNumber = orderNumberData;

    // Create order record
    const { data: order, error: orderError } = await supabaseClient
      .from('shop_orders')
      .insert({
        order_number: orderNumber,
        user_id: user_id || null,
        customer_name,
        customer_email,
        customer_phone,
        items,
        subtotal,
        total_amount,
        payment_method: 'card',
        payment_channel: 'paystack',
        transaction_status: 'pending'
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return new Response(
        JSON.stringify({ error: 'Failed to create order record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Order created:', order.id);

    // Initialize Paystack transaction
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    const amountInKobo = Math.round(total_amount * 100);

    const paystackPayload = {
      email: customer_email,
      amount: amountInKobo,
      currency: 'KES',
      reference: order.id,
      callback_url: `${req.headers.get('origin')}/shop/verify`,
      metadata: {
        order_id: order.id,
        order_number: orderNumber,
        customer_name,
        custom_fields: [
          {
            display_name: "Order Number",
            variable_name: "order_number",
            value: orderNumber
          }
        ]
      }
    };

    console.log('Initializing Paystack transaction:', paystackPayload.reference);

    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paystackPayload),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData.status) {
      console.error('Paystack error:', paystackData);
      
      // Update order status to failed
      await supabaseClient
        .from('shop_orders')
        .update({ transaction_status: 'failed' })
        .eq('id', order.id);

      return new Response(
        JSON.stringify({ error: paystackData.message || 'Payment initialization failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update order with Paystack reference
    await supabaseClient
      .from('shop_orders')
      .update({
        paystack_reference: paystackData.data.reference,
        transaction_reference: paystackData.data.reference
      })
      .eq('id', order.id);

    console.log('Shop payment initialized successfully:', paystackData.data.reference);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          authorization_url: paystackData.data.authorization_url,
          access_code: paystackData.data.access_code,
          reference: paystackData.data.reference,
          order_id: order.id,
          order_number: orderNumber
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in initialize-shop-payment:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
