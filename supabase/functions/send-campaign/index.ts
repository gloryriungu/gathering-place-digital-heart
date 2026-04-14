import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";
import { Resend } from "npm:resend@4.0.0";

const allowedOrigins = [
  'https://tot.co.ke',
  'https://stg.tot.co.ke',
  'http://localhost:5173',
  'https://id-preview--1002bdcc-1ba9-4425-9337-cf483dae12d9.lovable.app',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') ?? '';
  return {
    'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
  };
}

interface SendCampaignRequest {
  campaign_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = new Resend(resendApiKey);

    // Server-side role validation: only admin/marketing/it can send campaigns
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check user has an authorized role
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const authorizedRoles = ['admin', 'it', 'marketing', 'founder', 'senior_pastor'];
    if (!roles?.some(r => authorizedRoles.includes(r.role))) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: insufficient privileges' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { campaign_id }: SendCampaignRequest = await req.json();

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', campaign_id)
      .single();

    if (campaignError || !campaign) {
      throw new Error('Campaign not found');
    }

    // Update campaign status to sending
    await supabase
      .from('email_campaigns')
      .update({ status: 'sending' })
      .eq('id', campaign_id);

    // Get active subscribers based on segment filters
    let query = supabase
      .from('newsletter_subscribers')
      .select('email, first_name, last_name')
      .eq('is_active', true);

    const filters = campaign.segment_filters as any || {};
    if (filters.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }
    if (filters.source) {
      query = query.eq('source', filters.source);
    }

    const { data: subscribers, error: subsError } = await query;
    if (subsError) throw subsError;

    // Check suppression list
    const { data: suppressedEmails } = await supabase
      .from('suppression_list')
      .select('email');

    const suppressedSet = new Set(suppressedEmails?.map(s => s.email) || []);
    const validSubscribers = subscribers.filter(s => !suppressedSet.has(s.email));

    console.log(`Sending campaign to ${validSubscribers.length} subscribers`);

    let successCount = 0;
    let failureCount = 0;

    for (const subscriber of validSubscribers) {
      try {
        const personalizedHtml = campaign.html_content
          .replace(/\{\{first_name\}\}/g, subscriber.first_name || 'there')
          .replace(/\{\{last_name\}\}/g, subscriber.last_name || '');

        const { data, error } = await resend.emails.send({
          from: 'Mountain of Blessings <onboarding@resend.dev>',
          to: [subscriber.email],
          subject: campaign.subject,
          html: personalizedHtml,
          text: campaign.text_content || undefined,
        });

        if (error) throw new Error(`Resend error: ${JSON.stringify(error)}`);

        await supabase.from('email_analytics').insert({
          campaign_id: campaign_id,
          email: subscriber.email,
          sent_at: new Date().toISOString(),
        });

        await supabase
          .from('newsletter_subscribers')
          .update({ last_email_sent: new Date().toISOString() })
          .eq('email', subscriber.email);

        successCount++;
        console.log(`Sent to ${subscriber.email}: ${data?.id}`);

      } catch (error: any) {
        console.error(`Failed to send to ${subscriber.email}:`, error);
        failureCount++;
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    await supabase
      .from('email_campaigns')
      .update({ 
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq('id', campaign_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: successCount, 
        failed: failureCount,
        total: validSubscribers.length,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error sending campaign:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);