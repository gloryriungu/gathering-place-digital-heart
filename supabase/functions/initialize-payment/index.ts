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
      payment_method, 
      amount, 
      email, 
      phone, 
      contribution_type,
      user_id,
      save_details,
      name
    } = await req.json();

    console.log('Initialize payment request:', { payment_method, amount, email, contribution_type });

    // Validate inputs
    if (!payment_method || !amount || !email) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (amount < 10) {
      return new Response(
        JSON.stringify({ error: 'Minimum amount is KES 10' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (payment_method === 'mobile_money' && !phone) {
      return new Response(
        JSON.stringify({ error: 'Phone number required for M-Pesa' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get member_id if user is authenticated
    let member_id = null;
    if (user_id) {
      const { data: member } = await supabaseClient
        .from('members')
        .select('id')
        .eq('user_id', user_id)
        .maybeSingle();
      
      member_id = member?.id || null;
    }

    // Create contribution record
    const { data: contribution, error: contributionError } = await supabaseClient
      .from('contributions')
      .insert({
        amount,
        contribution_type: contribution_type || 'offering',
        member_id,
        donor_email: email,
        donor_phone: phone,
        donor_name: name,
        payment_method: payment_method === 'mobile_money' ? 'mpesa' : 'card',
        payment_channel: payment_method,
        transaction_status: 'pending',
        save_details: save_details || false,
        contribution_date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (contributionError) {
      console.error('Error creating contribution:', contributionError);
      return new Response(
        JSON.stringify({ error: 'Failed to create contribution record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Contribution created:', contribution.id);

    // Initialize Paystack transaction
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    const amountInKobo = Math.round(amount * 100); // Convert to kobo (smallest unit)

    const paystackPayload: any = {
      email,
      amount: amountInKobo,
      currency: 'KES',
      reference: contribution.id,
      callback_url: `${req.headers.get('origin')}/give/verify`,
      metadata: {
        contribution_id: contribution.id,
        contribution_type: contribution_type || 'offering',
        custom_fields: [
          {
            display_name: "Contribution Type",
            variable_name: "contribution_type",
            value: contribution_type || 'offering'
          }
        ]
      }
    };

    // Add channel-specific parameters
    if (payment_method === 'mobile_money') {
      // For M-Pesa, only specify the channel - Paystack handles the rest
      paystackPayload.channels = ['mobile_money'];
      // Phone must be in format 254XXXXXXXXX for Kenya M-Pesa
      if (phone) {
        paystackPayload.metadata.phone = phone;
      }
    } else {
      paystackPayload.channels = ['card'];
    }

    console.log('Initializing Paystack transaction:', paystackPayload.reference);

    // Use different endpoint for mobile money to trigger STK push
    const endpoint = payment_method === 'mobile_money' 
      ? 'https://api.paystack.co/charge'
      : 'https://api.paystack.co/transaction/initialize';

    // For mobile money, use charge payload format
    const requestPayload = payment_method === 'mobile_money' ? {
      email,
      amount: amountInKobo,
      currency: 'KES',
      reference: contribution.id,
      mobile_money: {
        phone,
        provider: 'mpg'  // mpg is Paystack's provider code for M-Pesa Kenya
      },
      metadata: paystackPayload.metadata
    } : paystackPayload;

    const paystackResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData.status) {
      console.error('Paystack error:', paystackData);
      
      // Update contribution status to failed
      await supabaseClient
        .from('contributions')
        .update({ transaction_status: 'failed' })
        .eq('id', contribution.id);

      return new Response(
        JSON.stringify({ error: paystackData.message || 'Payment initialization failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update contribution with Paystack reference
    const reference = paystackData.data.reference || contribution.id;
    await supabaseClient
      .from('contributions')
      .update({
        paystack_reference: reference,
        transaction_reference: reference
      })
      .eq('id', contribution.id);

    console.log('Payment initialized successfully:', reference);

    // For mobile money charge, return display info for pending status
    if (payment_method === 'mobile_money') {
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            reference,
            contribution_id: contribution.id,
            display_text: paystackData.data.display_text || 'Check your phone for M-Pesa prompt',
            status: 'pending'
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For card payments, return authorization URL
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          authorization_url: paystackData.data.authorization_url,
          access_code: paystackData.data.access_code,
          reference,
          contribution_id: contribution.id
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in initialize-payment:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});