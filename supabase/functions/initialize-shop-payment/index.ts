import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const ENDPOINT_NAME = 'initialize-shop-payment';

async function checkRateLimit(
  supabase: ReturnType<typeof createClient>,
  identifier: string
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW_MS);

  const { data: existingRequests, error: fetchError } = await supabase
    .from('rate_limit_tracking')
    .select('id, request_count, window_start')
    .eq('identifier', identifier)
    .eq('endpoint', ENDPOINT_NAME)
    .gte('window_start', windowStart.toISOString())
    .order('window_start', { ascending: false })
    .limit(1);

  if (fetchError) {
    console.error('Rate limit check error:', fetchError);
    return { allowed: true };
  }

  if (existingRequests && existingRequests.length > 0) {
    const record = existingRequests[0];
    if (record.request_count >= MAX_REQUESTS_PER_WINDOW) {
      const windowEnd = new Date(new Date(record.window_start).getTime() + RATE_LIMIT_WINDOW_MS);
      const retryAfter = Math.ceil((windowEnd.getTime() - now.getTime()) / 1000);
      console.warn(`Rate limit exceeded for ${identifier}`);
      return { allowed: false, retryAfter: Math.max(retryAfter, 1) };
    }
    await supabase
      .from('rate_limit_tracking')
      .update({ request_count: record.request_count + 1 })
      .eq('id', record.id);
  } else {
    await supabase
      .from('rate_limit_tracking')
      .insert({
        identifier,
        endpoint: ENDPOINT_NAME,
        request_count: 1,
        window_start: now.toISOString()
      });
  }

  return { allowed: true };
}

function getClientIP(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  const realIP = req.headers.get('x-real-ip');
  if (realIP) return realIP;
  return 'unknown';
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const clientIP = getClientIP(req);
  const rateLimitResult = await checkRateLimit(supabaseClient, clientIP);
  
  if (!rateLimitResult.allowed) {
    console.warn(`Rate limit blocked request from IP: ${clientIP}`);
    return new Response(
      JSON.stringify({ 
        error: 'Too many payment attempts. Please wait before trying again.',
        retry_after: rateLimitResult.retryAfter
      }),
      { 
        status: 429, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Retry-After': String(rateLimitResult.retryAfter)
        } 
      }
    );
  }

  try {
    const { 
      payment_method,
      customer_name,
      customer_email,
      customer_phone,
      items,
      subtotal,
      total_amount,
      user_id
    } = await req.json();

    console.log('Initialize shop payment:', { payment_method, customer_email, total_amount });

    if (!customer_name || !customer_email || !items || !total_amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'At least one item is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (typeof total_amount !== 'number' || total_amount < 10 || total_amount > 1000000) {
      return new Response(
        JSON.stringify({ error: 'Amount must be between KES 10 and KES 1,000,000' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (payment_method === 'mobile_money' && !customer_phone) {
      return new Response(
        JSON.stringify({ error: 'Phone number required for M-Pesa payment' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SERVER-SIDE PRICE VALIDATION
    let calculatedTotal = 0;
    for (const item of items) {
      if (!item.product_id || !item.quantity || item.quantity < 1) {
        return new Response(
          JSON.stringify({ error: 'Invalid item in cart' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: product, error: productError } = await supabaseClient
        .from('media_content')
        .select('id, title, content_data')
        .eq('id', item.product_id)
        .single();

      if (productError || !product) {
        console.error('Product not found:', item.product_id);
        return new Response(
          JSON.stringify({ error: `Product not found: ${item.product_id}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const actualPrice = (product.content_data as any)?.price || 0;
      const itemTotal = actualPrice * item.quantity;
      calculatedTotal += itemTotal;

      if (item.price !== undefined && Math.abs(item.price - actualPrice) > 0.01) {
        console.warn('Price mismatch detected:', { 
          product_id: item.product_id, 
          sent_price: item.price, 
          actual_price: actualPrice 
        });
        return new Response(
          JSON.stringify({ error: 'Price mismatch detected. Please refresh and try again.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const stock = (product.content_data as any)?.stock;
      if (stock !== undefined && stock !== null && stock < item.quantity) {
        return new Response(
          JSON.stringify({ error: `Insufficient stock for ${product.title}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (Math.abs(calculatedTotal - total_amount) > 0.01) {
      console.warn('Total mismatch detected:', { 
        sent_total: total_amount, 
        calculated_total: calculatedTotal 
      });
      return new Response(
        JSON.stringify({ error: 'Total amount mismatch. Please refresh and try again.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
        payment_method: payment_method === 'mobile_money' ? 'mpesa' : 'card',
        payment_channel: payment_method || 'card',
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

    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    const amountInKobo = Math.round(total_amount * 100);

    const paystackPayload: any = {
      email: customer_email,
      amount: amountInKobo,
      currency: 'KES',
      reference: order.id,
      callback_url: `${req.headers.get('origin') || 'https://stg.tot.co.ke'}/shop/verify`,
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

    if (payment_method === 'mobile_money') {
      paystackPayload.channels = ['mobile_money'];
      if (customer_phone) {
        paystackPayload.metadata.phone = customer_phone;
      }
    } else {
      paystackPayload.channels = ['card'];
    }

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
      await supabaseClient
        .from('shop_orders')
        .update({ transaction_status: 'failed' })
        .eq('id', order.id);

      return new Response(
        JSON.stringify({ error: paystackData.message || 'Payment initialization failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

  } catch (error: unknown) {
    console.error('Error in initialize-shop-payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});