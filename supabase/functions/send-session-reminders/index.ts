import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";
import { Resend } from "npm:resend@4.0.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

const formatSessionType = (type: string) => {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

const sendReminderEmail = async (resend: Resend, reminder: SessionReminder) => {
  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .info-box { background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #4F46E5; }
          .info-row { margin: 10px 0; }
          .label { font-weight: bold; color: #4F46E5; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 Counseling Session Reminder</h1>
          </div>
          <div class="content">
            <p>Dear ${reminder.member_first_name} ${reminder.member_last_name},</p>
            
            <p>This is a friendly reminder about your upcoming counseling session scheduled for tomorrow.</p>
            
            <div class="info-box">
              <div class="info-row">
                <span class="label">Date:</span> ${formatDate(reminder.session_date)}
              </div>
              <div class="info-row">
                <span class="label">Time:</span> ${formatTime(reminder.start_time)} - ${formatTime(reminder.end_time)}
              </div>
              <div class="info-row">
                <span class="label">Session Type:</span> ${formatSessionType(reminder.session_type)}
              </div>
              <div class="info-row">
                <span class="label">Pastor:</span> ${reminder.pastor_first_name} ${reminder.pastor_last_name}
              </div>
            </div>
            
            <p>Please arrive a few minutes early to ensure your session starts on time. If you need to reschedule or cancel, please contact us as soon as possible.</p>
            
            <p>We look forward to seeing you!</p>
            
            <div class="footer">
              <p>This is an automated reminder. Please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} Mountain of Blessings Revival Church. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const textBody = `
Counseling Session Reminder

Dear ${reminder.member_first_name} ${reminder.member_last_name},

This is a friendly reminder about your upcoming counseling session scheduled for tomorrow.

Session Details:
- Date: ${formatDate(reminder.session_date)}
- Time: ${formatTime(reminder.start_time)} - ${formatTime(reminder.end_time)}
- Session Type: ${formatSessionType(reminder.session_type)}
- Pastor: ${reminder.pastor_first_name} ${reminder.pastor_last_name}

Please arrive a few minutes early to ensure your session starts on time. If you need to reschedule or cancel, please contact us as soon as possible.

We look forward to seeing you!

This is an automated reminder. Please do not reply to this email.
© ${new Date().getFullYear()} Mountain of Blessings Revival Church. All rights reserved.
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: "Mountain of Blessings <onboarding@resend.dev>",
      to: [reminder.member_email],
      subject: "Reminder: Your Counseling Session Tomorrow",
      html: htmlBody,
      text: textBody,
    });

    if (error) {
      console.error(`Failed to send reminder to ${reminder.member_email}:`, error);
      return { success: false, error };
    }

    console.log(`Reminder sent successfully to ${reminder.member_email}`);
    return { success: true, data };
  } catch (error: unknown) {
    console.error(`Error sending reminder to ${reminder.member_email}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    // Calculate the date range for tomorrow (24 hours from now)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDateStr = tomorrow.toISOString().split('T')[0];

    console.log(`Checking for sessions on ${tomorrowDateStr}`);

    // Fetch sessions scheduled for tomorrow with status 'scheduled'
    const { data: sessions, error: sessionsError } = await supabase
      .from('counseling_sessions')
      .select('*')
      .eq('session_date', tomorrowDateStr)
      .eq('status', 'scheduled');

    if (sessionsError) {
      console.error("Error fetching sessions:", sessionsError);
      throw sessionsError;
    }

    if (!sessions || sessions.length === 0) {
      console.log("No sessions scheduled for tomorrow");
      return new Response(
        JSON.stringify({ success: true, message: "No sessions to remind", count: 0 }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Found ${sessions.length} sessions to send reminders for`);

    // Fetch member and pastor details
    const memberIds = [...new Set(sessions.map(s => s.member_id))];
    const pastorIds = [...new Set(sessions.map(s => s.pastor_id))];

    const { data: memberProfiles, error: memberError } = await supabase
      .from('profiles')
      .select('user_id, first_name, last_name')
      .in('user_id', memberIds);

    const { data: pastorProfiles, error: pastorError } = await supabase
      .from('profiles')
      .select('user_id, first_name, last_name')
      .in('user_id', pastorIds);

    // Get member emails from members table
    const { data: members, error: membersTableError } = await supabase
      .from('members')
      .select('user_id, email')
      .in('user_id', memberIds)
      .not('email', 'is', null);

    if (memberError || pastorError || membersTableError) {
      console.error("Error fetching profiles:", { memberError, pastorError, membersTableError });
      throw memberError || pastorError || membersTableError;
    }

    // Build reminders
    const reminders: SessionReminder[] = [];
    for (const session of sessions) {
      const memberProfile = memberProfiles?.find(p => p.user_id === session.member_id);
      const memberRecord = members?.find(m => m.user_id === session.member_id);
      const pastorProfile = pastorProfiles?.find(p => p.user_id === session.pastor_id);

      if (!memberRecord?.email) {
        console.log(`Skipping session ${session.id}: No email found for member ${session.member_id}`);
        continue;
      }

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

    console.log(`Sending ${reminders.length} reminder emails`);

    // Send all reminders
    const results = await Promise.all(
      reminders.map(reminder => sendReminderEmail(resend, reminder))
    );

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log(`Reminders sent: ${successCount} successful, ${failureCount} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Sent ${successCount} reminders, ${failureCount} failed`,
        total: reminders.length,
        successful: successCount,
        failed: failureCount
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: unknown) {
    console.error("Error in send-session-reminders function:", error);
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
