import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendCampaignRequest {
  campaign_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const postmarkKey = Deno.env.get('POSTMARK_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

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

    // Apply segment filters
    const filters = campaign.segment_filters as any || {};
    if (filters.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }
    if (filters.source) {
      query = query.eq('source', filters.source);
    }

    const { data: subscribers, error: subsError } = await query;

    if (subsError) {
      throw subsError;
    }

    // Check suppression list and filter out suppressed emails
    const { data: suppressedEmails } = await supabase
      .from('suppression_list')
      .select('email');

    const suppressedSet = new Set(suppressedEmails?.map(s => s.email) || []);
    const validSubscribers = subscribers.filter(s => !suppressedSet.has(s.email));

    console.log(`Sending campaign to ${validSubscribers.length} subscribers`);

    let successCount = 0;
    let failureCount = 0;

    // Send emails in batches
    for (const subscriber of validSubscribers) {
      try {
        // Personalize content
        const personalizedHtml = campaign.html_content
          .replace(/\{\{first_name\}\}/g, subscriber.first_name || 'there')
          .replace(/\{\{last_name\}\}/g, subscriber.last_name || '');

        // Send via Postmark
        const response = await fetch('https://api.postmarkapp.com/email', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Postmark-Server-Token': postmarkKey,
          },
          body: JSON.stringify({
            From: 'noreply@yourchurch.org',
            To: subscriber.email,
            Subject: campaign.subject,
            HtmlBody: personalizedHtml,
            TextBody: campaign.text_content || undefined,
            MessageStream: 'outbound',
          }),
        });

        if (!response.ok) {
          throw new Error(`Postmark error: ${await response.text()}`);
        }

        const result = await response.json();

        // Record analytics
        await supabase.from('email_analytics').insert({
          campaign_id: campaign_id,
          email: subscriber.email,
          sent_at: new Date().toISOString(),
        });

        // Update last email sent
        await supabase
          .from('newsletter_subscribers')
          .update({ last_email_sent: new Date().toISOString() })
          .eq('email', subscriber.email);

        successCount++;
        console.log(`Sent to ${subscriber.email}: ${result.MessageID}`);

      } catch (error: any) {
        console.error(`Failed to send to ${subscriber.email}:`, error);
        failureCount++;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Update campaign status
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
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error sending campaign:', error);
    
    // Update campaign status to failed
    if (error.campaign_id) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      await supabase
        .from('email_campaigns')
        .update({ status: 'failed' })
        .eq('id', error.campaign_id);
    }

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
