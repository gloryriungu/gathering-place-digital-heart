import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  let logId: string | null = null;

  try {
    const signature = req.headers.get('x-paystack-signature');
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip');
    const userAgent = req.headers.get('user-agent');
    
    // Get raw body for signature verification
    const body = await req.text();
    const event = JSON.parse(body);

    // Create initial log entry
    const { data: logEntry, error: logError } = await supabaseClient
      .from('paystack_webhook_logs')
      .insert({
        event_type: event.event,
        event_data: event,
        signature_valid: false,
        processing_status: 'pending',
        reference: event.data?.reference || null,
        ip_address: ipAddress,
        user_agent: userAgent
      })
      .select()
      .single();

    if (logEntry) {
      logId = logEntry.id;
    }

    if (logError) {
      console.error('Error creating webhook log:', logError);
    }

    // Verify signature
    if (!signature) {
      console.error('Missing Paystack signature');
      
      if (logId) {
        await supabaseClient
          .from('paystack_webhook_logs')
          .update({
            processing_status: 'failed',
            processing_error: 'Missing Paystack signature',
            processed_at: new Date().toISOString()
          })
          .eq('id', logId);
      }
      
      return new Response('Unauthorized', { status: 401 });
    }

    // Verify webhook signature
    const hash = createHmac('sha512', paystackSecretKey || '')
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      console.error('Invalid Paystack signature');
      
      if (logId) {
        await supabaseClient
          .from('paystack_webhook_logs')
          .update({
            processing_status: 'failed',
            processing_error: 'Invalid Paystack signature',
            processed_at: new Date().toISOString()
          })
          .eq('id', logId);
      }
      
      return new Response('Unauthorized', { status: 401 });
    }

    // Update log with valid signature
    if (logId) {
      await supabaseClient
        .from('paystack_webhook_logs')
        .update({ signature_valid: true })
        .eq('id', logId);
    }

    console.log('Paystack webhook event:', event.event);

    // Handle different event types
    let processingError: string | null = null;
    let contributionId: string | null = null;

    switch (event.event) {
      case 'charge.success': {
        const data = event.data;
        console.log('Processing successful charge:', data.reference);
        contributionId = data.reference;

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
          processingError = error.message;
        } else {
          console.log('Contribution updated successfully:', data.reference);
        }
        break;
      }

      case 'charge.failed': {
        const data = event.data;
        console.log('Processing failed charge:', data.reference);
        contributionId = data.reference;

        const { error } = await supabaseClient
          .from('contributions')
          .update({
            transaction_status: 'failed',
            notes: data.gateway_response || 'Payment failed'
          })
          .eq('id', data.reference);

        if (error) {
          console.error('Error updating contribution:', error);
          processingError = error.message;
        }
        break;
      }

      default:
        console.log('Unhandled event type:', event.event);
        processingError = `Unhandled event type: ${event.event}`;
    }

    // Update log with processing result
    if (logId) {
      await supabaseClient
        .from('paystack_webhook_logs')
        .update({
          processing_status: processingError ? 'failed' : 'success',
          processing_error: processingError,
          related_contribution_id: contributionId,
          processed_at: new Date().toISOString()
        })
        .eq('id', logId);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in webhook-paystack:', error);
    
    // Log the error
    if (logId) {
      await supabaseClient
        .from('paystack_webhook_logs')
        .update({
          processing_status: 'failed',
          processing_error: error.message,
          processed_at: new Date().toISOString()
        })
        .eq('id', logId);
    }
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});