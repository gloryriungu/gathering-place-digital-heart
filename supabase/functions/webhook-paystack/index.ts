import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

// Server-to-server webhook — NO CORS headers needed

interface AdminUser {
  email: string;
  first_name: string | null;
  last_name: string | null;
}

async function getAdminEmails(supabaseClient: any): Promise<AdminUser[]> {
  try {
    const { data, error } = await supabaseClient
      .from('user_roles')
      .select(`user_id, profiles!inner(user_id, first_name, last_name)`)
      .in('role', ['admin', 'founder', 'accounts', 'it']);

    if (error) { console.error('Error fetching admin users:', error); return []; }

    const { data: authUsers, error: authError } = await supabaseClient.auth.admin.listUsers();
    if (authError) { console.error('Error fetching auth users:', authError); return []; }

    const adminUsers: AdminUser[] = [];
    for (const row of data) {
      const authUser = authUsers.users.find((u: any) => u.id === row.user_id);
      if (authUser?.email) {
        adminUsers.push({
          email: authUser.email,
          first_name: row.profiles.first_name,
          last_name: row.profiles.last_name
        });
      }
    }
    return adminUsers;
  } catch (error) {
    console.error('Error in getAdminEmails:', error);
    return [];
  }
}

async function sendCriticalAlert(adminEmails: AdminUser[], subject: string, alertType: string, details: any) {
  const postmarkApiKey = Deno.env.get('POSTMARK_API_KEY');
  if (!postmarkApiKey || adminEmails.length === 0) return;

  const htmlBody = `<!DOCTYPE html><html><head><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333}.container{max-width:600px;margin:0 auto;padding:20px}.alert-box{background-color:#fee;border-left:4px solid #dc2626;padding:15px;margin:20px 0}.alert-header{color:#dc2626;font-size:18px;font-weight:bold;margin-bottom:10px}.details{background-color:#f5f5f5;padding:15px;border-radius:4px;margin:15px 0}.detail-row{margin:8px 0}.label{font-weight:bold;color:#666}pre{background-color:#f5f5f5;padding:10px;border-radius:4px;overflow-x:auto}.footer{margin-top:30px;padding-top:20px;border-top:1px solid #ddd;color:#666;font-size:12px}</style></head><body><div class="container"><h2>🚨 Critical Webhook Alert</h2><div class="alert-box"><div class="alert-header">${alertType}</div><p>A critical webhook failure has been detected.</p></div><div class="details"><div class="detail-row"><span class="label">Event Type:</span> ${details.event_type || 'Unknown'}</div><div class="detail-row"><span class="label">Reference:</span> ${details.reference || 'N/A'}</div><div class="detail-row"><span class="label">Timestamp:</span> ${new Date().toISOString()}</div><div class="detail-row"><span class="label">IP Address:</span> ${details.ip_address || 'Unknown'}</div>${details.error_message ? `<div class="detail-row"><span class="label">Error:</span><pre>${details.error_message}</pre></div>` : ''}</div><p><strong>Action Required:</strong> Review webhook logs in your dashboard.</p><div class="footer"><p>Automated alert from your church management system.</p></div></div></body></html>`;

  try {
    await Promise.all(adminEmails.map(async (admin) => {
      const response = await fetch('https://api.postmarkapp.com/email', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'X-Postmark-Server-Token': postmarkApiKey },
        body: JSON.stringify({ From: 'alerts@stg.tot.co.ke', To: admin.email, Subject: subject, HtmlBody: htmlBody, MessageStream: 'outbound' }),
      });
      if (!response.ok) console.error(`Failed to send alert to ${admin.email}:`, await response.text());
    }));
  } catch (error) {
    console.error('Error sending alert emails:', error);
  }
}

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
    
    const body = await req.text();
    const event = JSON.parse(body);

    const { data: logEntry } = await supabaseClient
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

    if (logEntry) logId = logEntry.id;

    if (!signature) {
      console.error('Missing Paystack signature');
      if (logId) await supabaseClient.from('paystack_webhook_logs').update({ processing_status: 'failed', processing_error: 'Missing Paystack signature', processed_at: new Date().toISOString() }).eq('id', logId);

      const adminEmails = await getAdminEmails(supabaseClient);
      sendCriticalAlert(adminEmails, '🚨 Critical: Paystack Webhook Security Alert - Missing Signature', 'Security Alert: Missing Webhook Signature', { event_type: event?.event, reference: event?.data?.reference, ip_address: ipAddress, error_message: 'Webhook received without required signature header.' }).catch(err => console.error('Failed to send alert:', err));
      
      return new Response('Unauthorized', { status: 401 });
    }

    const hash = createHmac('sha512', paystackSecretKey || '').update(body).digest('hex');

    if (hash !== signature) {
      console.error('Invalid Paystack signature');
      if (logId) await supabaseClient.from('paystack_webhook_logs').update({ processing_status: 'failed', processing_error: 'Invalid Paystack signature', processed_at: new Date().toISOString() }).eq('id', logId);

      const adminEmails = await getAdminEmails(supabaseClient);
      sendCriticalAlert(adminEmails, '🚨 Critical: Paystack Webhook Security Alert - Invalid Signature', 'Security Alert: Invalid Webhook Signature', { event_type: event?.event, reference: event?.data?.reference, ip_address: ipAddress, error_message: 'Webhook signature verification failed.' }).catch(err => console.error('Failed to send alert:', err));
      
      return new Response('Unauthorized', { status: 401 });
    }

    if (logId) await supabaseClient.from('paystack_webhook_logs').update({ signature_valid: true }).eq('id', logId);

    console.log('Paystack webhook event:', event.event);

    let processingError: string | null = null;
    let contributionId: string | null = null;

    switch (event.event) {
      case 'charge.success': {
        const data = event.data;
        contributionId = data.reference;
        const { error } = await supabaseClient.from('contributions').update({
          transaction_status: 'completed',
          paystack_reference: data.reference,
          transaction_reference: data.reference,
          notes: data.gateway_response || null
        }).eq('id', data.reference);

        if (error) {
          processingError = error.message;
          const adminEmails = await getAdminEmails(supabaseClient);
          sendCriticalAlert(adminEmails, '⚠️ Webhook Processing Error: Database Update Failed', 'Processing Error', { event_type: event.event, reference: data.reference, ip_address: ipAddress, error_message: error.message }).catch(err => console.error('Failed to send alert:', err));
        }
        break;
      }

      case 'charge.failed': {
        const data = event.data;
        contributionId = data.reference;
        const { error } = await supabaseClient.from('contributions').update({
          transaction_status: 'failed',
          notes: data.gateway_response || 'Payment failed'
        }).eq('id', data.reference);

        if (error) {
          processingError = error.message;
          const adminEmails = await getAdminEmails(supabaseClient);
          sendCriticalAlert(adminEmails, '⚠️ Webhook Processing Error: Database Update Failed', 'Processing Error', { event_type: event.event, reference: data.reference, ip_address: ipAddress, error_message: error.message }).catch(err => console.error('Failed to send alert:', err));
        }
        break;
      }

      default:
        processingError = `Unhandled event type: ${event.event}`;
    }

    if (logId) {
      await supabaseClient.from('paystack_webhook_logs').update({
        processing_status: processingError ? 'failed' : 'success',
        processing_error: processingError,
        related_contribution_id: contributionId,
        processed_at: new Date().toISOString()
      }).eq('id', logId);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('Error in webhook-paystack:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';

    if (logId) {
      await supabaseClient.from('paystack_webhook_logs').update({ processing_status: 'failed', processing_error: errorMessage, processed_at: new Date().toISOString() }).eq('id', logId);
    }

    const adminEmails = await getAdminEmails(supabaseClient);
    sendCriticalAlert(adminEmails, '🚨 Critical: Webhook System Error', 'System Error', { event_type: 'system_error', ip_address: null, error_message: `${errorMessage}\n\n${errorStack}` }).catch(err => console.error('Failed to send alert:', err));
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});