import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string | string[];
  subject: string;
  htmlBody: string;
  textBody?: string;
  from?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, htmlBody, textBody, from }: EmailRequest = await req.json();
    const fromAddress = from || "Mountain of Blessings <onboarding@resend.dev>";

    console.log("Sending email to:", to);

    // Handle bulk emails (array of recipients)
    if (Array.isArray(to)) {
      const results = await Promise.all(
        to.map(async (recipient) => {
          try {
            const { data, error } = await resend.emails.send({
              from: fromAddress,
              to: [recipient],
              subject: subject,
              html: htmlBody,
              text: textBody || htmlBody.replace(/<[^>]*>/g, ""),
            });

            if (error) {
              console.error(`Failed to send email to ${recipient}:`, error);
              return { recipient, success: false, error };
            }

            console.log(`Email sent successfully to ${recipient}`);
            return { recipient, success: true, data };
          } catch (error: unknown) {
            console.error(`Error sending email to ${recipient}:`, error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return { recipient, success: false, error: errorMessage };
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
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [to],
      subject: subject,
      html: htmlBody,
      text: textBody || htmlBody.replace(/<[^>]*>/g, ""),
    });

    if (error) {
      console.error("Resend API error:", error);
      return new Response(
        JSON.stringify({ error }),
        {
          status: 400,
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
  } catch (error: unknown) {
    console.error("Error in send-email function:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
