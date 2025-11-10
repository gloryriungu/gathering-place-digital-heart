import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PostmarkBounceWebhook {
  RecordType: string;
  MessageID: string;
  Type: string; // HardBounce, Transient, Blocked, SpamComplaint
  TypeCode: number;
  Email: string;
  BouncedAt: string;
  Description: string;
  Details: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const bounceData: PostmarkBounceWebhook = await req.json();
    
    console.log('Received bounce webhook:', bounceData);

    // Map Postmark bounce types to our types
    let bounceType = 'soft';
    if (bounceData.Type === 'HardBounce' || bounceData.TypeCode >= 400) {
      bounceType = 'hard';
    } else if (bounceData.Type === 'SpamComplaint') {
      bounceType = 'spam_complaint';
    }

    // Insert bounce record (this will trigger the handle_email_bounce function)
    const { error: bounceError } = await supabase
      .from('email_bounces')
      .insert({
        email: bounceData.Email.toLowerCase(),
        bounce_type: bounceType,
        bounce_reason: bounceData.Description || bounceData.Details,
        occurred_at: bounceData.BouncedAt,
        message_id: bounceData.MessageID,
      });

    if (bounceError) {
      console.error('Error inserting bounce:', bounceError);
      throw bounceError;
    }

    console.log(`Successfully processed ${bounceType} bounce for ${bounceData.Email}`);

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
