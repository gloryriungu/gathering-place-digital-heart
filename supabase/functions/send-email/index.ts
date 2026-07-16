import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const allowedOrigins = [
  'https://tot.co.ke',
  'https://stg.tot.co.ke',
  'http://localhost:5173',
  'https://id-preview--1002bdcc-1ba9-4425-9337-cf483dae12d9.lovable.app',
  'https://1002bdcc-1ba9-4425-9337-cf483dae12d9.lovableproject.com',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') ?? '';
  return {
    'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
  };
}

interface EmailRequest {
  to: string | string[];
  subject: string;
  htmlBody: string;
  textBody?: string;
  from?: string;
}

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, htmlBody, textBody, from }: EmailRequest = await req.json();
    const fromAddress = from || "Mountain of Blessings <info@tot.co.ke>";

    console.log("Sending email to:", to);

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

            return { recipient, success: true, data };
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return { recipient, success: false, error: errorMessage };
          }
        })
      );

      return new Response(
        JSON.stringify({ success: true, results }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

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
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...getCorsHeaders(req) } }
    );
  }
};

serve(handler);