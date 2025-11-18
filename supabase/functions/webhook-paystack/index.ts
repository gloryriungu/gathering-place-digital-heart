import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

serve(async (req) => {
  try {
    const signature = req.headers.get('x-paystack-signature');
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    
    if (!signature) {
      console.error('Missing Paystack signature');
      return new Response('Unauthorized', { status: 401 });
    }

    // Get raw body for signature verification
    const body = await req.text();
    
    // Verify webhook signature
    const hash = createHmac('sha512', paystackSecretKey || '')
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      console.error('Invalid Paystack signature');
      return new Response('Unauthorized', { status: 401 });
    }

    const event = JSON.parse(body);
    console.log('Paystack webhook event:', event.event);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Handle different event types
    switch (event.event) {
      case 'charge.success': {
        const data = event.data;
        console.log('Processing successful charge:', data.reference);

        // Update contribution status
        const { error } = await supabaseClient
          .from('contributions')
          .update({
            transaction_status: 'completed',
            paystack_reference: data.reference,
            transaction_reference: data.reference,
            notes: data.gateway_response || null
          })
          .eq('id', data.reference);

        if (error) {
          console.error('Error updating contribution:', error);
        } else {
          console.log('Contribution updated successfully:', data.reference);
        }
        break;
      }

      case 'charge.failed': {
        const data = event.data;
        console.log('Processing failed charge:', data.reference);

        await supabaseClient
          .from('contributions')
          .update({
            transaction_status: 'failed',
            notes: data.gateway_response || 'Payment failed'
          })
          .eq('id', data.reference);
        break;
      }

      default:
        console.log('Unhandled event type:', event.event);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in webhook-paystack:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});