import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";
import { Resend } from "npm:resend@4.0.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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

interface SessionReminder {
  session_id: string;
  member_email: string;
  member_first_name: string;
  member_last_name: string;
  pastor_first_name: string;
  pastor_last_name: string;
  session_date: string;
  start_time: string;
  end_time: string;
  session_type: string;
}

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

const formatSessionType = (type: string) => {
  return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const sendReminderEmail = async (resend: Resend, reminder: SessionReminder) => {
  const htmlBody = `<!DOCTYPE html><html><head><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333}.container{max-width:600px;margin:0 auto;padding:20px}.header{background-color:#4F46E5;color:white;padding:30px;text-align:center;border-radius:8px 8px 0 0}.content{background-color:#f9fafb;padding:30px;border-radius:0 0 8px 8px}.info-box{background-color:white;padding:20px;border-radius:6px;margin:20px 0;border-left:4px solid #4F46E5}.info-row{margin:10px 0}.label{font-weight:bold;color:#4F46E5}.footer{text-align:center;margin-top:30px;color:#6b7280;font-size:14px}</style></head><body><div class="container"><div class="header"><h1>📅 Counseling Session Reminder</h1></div><div class="content"><p>Dear ${reminder.member_first_name} ${reminder.member_last_name},</p><p>This is a friendly reminder about your upcoming counseling session scheduled for tomorrow.</p><div class="info-box"><div class="info-row"><span class="label">Date:</span> ${formatDate(reminder.session_date)}</div><div class="info-row"><span class="label">Time:</span> ${formatTime(reminder.start_time)} - ${formatTime(reminder.end_time)}</div><div class="info-row"><span class="label">Session Type:</span> ${formatSessionType(reminder.session_type)}</div><div class="info-row"><span class="label">Pastor:</span> ${reminder.pastor_first_name} ${reminder.pastor_last_name}</div></div><p>Please arrive a few minutes early. If you need to reschedule or cancel, please contact us as soon as possible.</p><p>We look forward to seeing you!</p><div class="footer"><p>This is an automated reminder. Please do not reply to this email.</p><p>&copy; ${new Date().getFullYear()} Mountain of Blessings Revival Church. All rights reserved.</p></div></div></div></body></html>`;

  try {
    const { data, error } = await resend.emails.send({
      from: "Mountain of Blessings <info@tot.co.ke>",
      to: [reminder.member_email],
      subject: "Reminder: Your Counseling Session Tomorrow",
      html: htmlBody,
    });

    if (error) {
      console.error(`Failed to send reminder to ${reminder.member_email}:`, error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
};

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDateStr = tomorrow.toISOString().split('T')[0];

    const { data: sessions, error: sessionsError } = await supabase
      .from('counseling_sessions')
      .select('*')
      .eq('session_date', tomorrowDateStr)
      .eq('status', 'scheduled');

    if (sessionsError) throw sessionsError;

    if (!sessions || sessions.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No sessions to remind", count: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const memberIds = [...new Set(sessions.map(s => s.member_id))];
    const pastorIds = [...new Set(sessions.map(s => s.pastor_id))];

    const { data: memberProfiles } = await supabase
      .from('profiles').select('user_id, first_name, last_name').in('user_id', memberIds);
    const { data: pastorProfiles } = await supabase
      .from('profiles').select('user_id, first_name, last_name').in('user_id', pastorIds);
    const { data: members } = await supabase
      .from('members').select('user_id, email').in('user_id', memberIds).not('email', 'is', null);

    const reminders: SessionReminder[] = [];
    for (const session of sessions) {
      const memberProfile = memberProfiles?.find(p => p.user_id === session.member_id);
      const memberRecord = members?.find(m => m.user_id === session.member_id);
      const pastorProfile = pastorProfiles?.find(p => p.user_id === session.pastor_id);

      if (!memberRecord?.email) continue;

      reminders.push({
        session_id: session.id,
        member_email: memberRecord.email,
        member_first_name: memberProfile?.first_name || "Member",
        member_last_name: memberProfile?.last_name || "",
        pastor_first_name: pastorProfile?.first_name || "Pastor",
        pastor_last_name: pastorProfile?.last_name || "",
        session_date: session.session_date,
        start_time: session.start_time,
        end_time: session.end_time,
        session_type: session.session_type,
      });
    }

    const results = await Promise.all(reminders.map(r => sendReminderEmail(resend, r)));
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return new Response(
      JSON.stringify({ success: true, total: reminders.length, successful: successCount, failed: failureCount }),
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