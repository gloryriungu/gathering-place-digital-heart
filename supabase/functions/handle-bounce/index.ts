import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Resend webhook event types
interface ResendBounceWebhook {
  type: string; // "email.bounced", "email.complained", "email.delivered", etc.
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at: string;
    bounce?: {
      message: string;
    };
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const webhookData: ResendBounceWebhook = await req.json();
    
    console.log('Received Resend webhook:', webhookData);

    // Only process bounce and complaint events
    if (!['email.bounced', 'email.complained'].includes(webhookData.type)) {
      console.log(`Ignoring event type: ${webhookData.type}`);
      return new Response(
        JSON.stringify({ success: true, message: 'Event type ignored' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Map Resend event types to our bounce types
    let bounceType = 'soft';
    if (webhookData.type === 'email.bounced') {
      bounceType = 'hard';
    } else if (webhookData.type === 'email.complained') {
      bounceType = 'spam_complaint';
    }

    // Process each recipient
    for (const email of webhookData.data.to) {
      // Insert bounce record (this will trigger the handle_email_bounce function)
      const { error: bounceError } = await supabase
        .from('email_bounces')
        .insert({
          email: email.toLowerCase(),
          bounce_type: bounceType,
          bounce_reason: webhookData.data.bounce?.message || `Resend ${webhookData.type}`,
          occurred_at: webhookData.created_at,
          message_id: webhookData.data.email_id,
        });

      if (bounceError) {
        console.error('Error inserting bounce:', bounceError);
        throw bounceError;
      }

      console.log(`Successfully processed ${bounceType} bounce for ${email}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Bounce processed' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error processing bounce:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(handler);
