import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const POSTMARK_API_KEY = Deno.env.get("POSTMARK_API_KEY");
const POSTMARK_API_URL = "https://api.postmarkapp.com/email";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string | string[];
  subject: string;
  htmlBody: string;
  textBody?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, htmlBody, textBody }: EmailRequest = await req.json();

    console.log("Sending email to:", to);

    // Handle bulk emails (array of recipients)
    if (Array.isArray(to)) {
      const results = await Promise.all(
        to.map(async (recipient) => {
          try {
            const response = await fetch(POSTMARK_API_URL, {
              method: "POST",
              headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "X-Postmark-Server-Token": POSTMARK_API_KEY!,
              },
              body: JSON.stringify({
                From: "1040458@cuea.edu",
                To: recipient,
                Subject: subject,
                HtmlBody: htmlBody,
                TextBody: textBody || htmlBody.replace(/<[^>]*>/g, ""),
                MessageStream: "outbound",
              }),
            });

            const data = await response.json();
            
            if (!response.ok) {
              console.error(`Failed to send email to ${recipient}:`, data);
              return { recipient, success: false, error: data };
            }

            console.log(`Email sent successfully to ${recipient}`);
            return { recipient, success: true, data };
          } catch (error) {
            console.error(`Error sending email to ${recipient}:`, error);
            return { recipient, success: false, error: error.message };
          }
        })
      );

      return new Response(
        JSON.stringify({ success: true, results }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Handle single email
    const response = await fetch(POSTMARK_API_URL, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": POSTMARK_API_KEY!,
      },
      body: JSON.stringify({
        From: "1040458@cuea.edu",
        To: to,
        Subject: subject,
        HtmlBody: htmlBody,
        TextBody: textBody || htmlBody.replace(/<[^>]*>/g, ""),
        MessageStream: "outbound",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Postmark API error:", data);
      return new Response(
        JSON.stringify({ error: data }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Email sent successfully:", data);

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
