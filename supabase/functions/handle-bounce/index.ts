import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

// handle-bounce is a webhook endpoint called by Resend servers.
// No browser CORS needed, but we keep minimal headers for compatibility.

interface ResendBounceWebhook {
  type: string;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at: string;
    bounce?: { message: string };
  };
}

function verifyResendSignature(body: string, headers: Headers, secret: string): boolean {
  const svixId = headers.get('svix-id');
  const svixTimestamp = headers.get('svix-timestamp');
  const svixSignature = headers.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error('Missing svix headers for signature verification');
    return false;
  }

  const timestampSeconds = parseInt(svixTimestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestampSeconds) > 300) {
    console.error('Webhook timestamp too old, possible replay attack');
    return false;
  }

  const secretBytes = Uint8Array.from(atob(secret.startsWith('whsec_') ? secret.slice(6) : secret), c => c.charCodeAt(0));
  const signedContent = `${svixId}.${svixTimestamp}.${body}`;
  const expectedSig = createHmac('sha256', secretBytes).update(signedContent).digest('base64');

  const signatures = svixSignature.split(' ');
  return signatures.some(s => s.startsWith('v1,') && s.slice(3) === expectedSig);
}

const handler = async (req: Request): Promise<Response> => {
  // Server-to-server webhook — no CORS needed
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  try {
    const signingSecret = Deno.env.get('RESEND_WEBHOOK_SECRET');
    if (!signingSecret) {
      console.error('RESEND_WEBHOOK_SECRET is not configured');
      return new Response(
        JSON.stringify({ error: 'Webhook secret not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.text();

    if (!verifyResendSignature(body, req.headers, signingSecret)) {
      console.error('Invalid webhook signature - rejecting request');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const webhookData: ResendBounceWebhook = JSON.parse(body);
    console.log('Received verified Resend webhook:', webhookData.type);

    if (!['email.bounced', 'email.complained'].includes(webhookData.type)) {
      return new Response(
        JSON.stringify({ success: true, message: 'Event type ignored' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let bounceType = 'soft';
    if (webhookData.type === 'email.bounced') bounceType = 'hard';
    else if (webhookData.type === 'email.complained') bounceType = 'spam_complaint';

    for (const email of webhookData.data.to) {
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
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Bounce processed' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error processing bounce:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
