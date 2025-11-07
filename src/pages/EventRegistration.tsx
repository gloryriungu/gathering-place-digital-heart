/**
 * EVENT REGISTRATION PAGE - RSVP & SIGN UP FOR EVENTS
 * 
 * LANGUAGE/FRAMEWORK: TypeScript + React (TSX)
 * - TypeScript: Type safety for event and registration data
 * - React: Dynamic form rendering based on event configuration
 * - React Router: useParams for event ID, useNavigate for navigation
 * 
 * FUNCTIONALITY:
 * Dynamic event registration page that displays specific event details and registration form:
 * 
 * EVENT DETAILS DISPLAYED:
 * - Event title and description
 * - Event image (if available)
 * - Date, time, and location information
 * - Current attendance count vs. max capacity
 * - Registration deadline
 * - RSVP status badge
 * 
 * REGISTRATION FORM:
 * - Powered by EventRegistrationForm component
 * - Supports custom fields defined by event organizers
 * - Tracks current attendee count in real-time
 * - Prevents registration if event is full
 * - Enforces registration deadline
 * - Collects attendee information
 * 
 * DATA FETCHING:
 * - Fetches event details from Supabase 'media_content' table
 * - Filters for published events only (status = 'published')
 * - Counts confirmed registrations for capacity management
 * - Real-time attendee count updates
 * 
 * USER EXPERIENCE:
 * - Loading skeleton while fetching event data
 * - "Back to Events" button for easy navigation
 * - Graceful handling of invalid event IDs (redirects to events page)
 * - Clear messaging if registration is closed or unavailable
 * - Responsive design for all devices
 * 
 * ACCESS CONTROL:
 * - Only displays events with RSVP enabled (enable_rsvp = true)
 * - Shows appropriate message if registration is not available
 * - Validates event exists before showing registration form
 * 
 * INTEGRATION:
 * - Integrates with media dashboard for event creation
 * - Stores registrations in 'event_registrations' table
 * - Supports custom field configuration per event
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { EventRegistrationForm } from "@/components/media/EventRegistrationForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const EventRegistration = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentAttendees, setCurrentAttendees] = useState(0);

  useEffect(() => {
    if (eventId) {
      fetchEvent();
      fetchAttendeeCount();
    }
  }, [eventId]);

  const fetchEvent = async () => {
    const { data, error } = await supabase
      .from('media_content')
      .select('*')
      .eq('id', eventId)
      .eq('content_type', 'event')
      .eq('status', 'published')
      .single();

    if (error || !data) {
      navigate('/events');
      return;
    }

    setEvent(data);
    setLoading(false);
  };

  const fetchAttendeeCount = async () => {
    const { count } = await supabase
      .from('event_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('status', 'confirmed');

    setCurrentAttendees(count || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-96 w-full" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!event || !event.content_data.enable_rsvp) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Registration Not Available</h1>
          <p className="text-muted-foreground mb-6">
            This event does not have registration enabled.
          </p>
          <Button onClick={() => navigate('/events')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20">
        <section className="py-12 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/events')}
              className="mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Events
            </Button>

            <div className="mb-8">
              {event.image_url && (
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
              )}
              <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
              <p className="text-lg text-muted-foreground mb-4">
                {event.description}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span>📅 {event.content_data.date}</span>
                {event.content_data.time && <span>🕐 {event.content_data.time}</span>}
                {event.content_data.location && (
                  <span>📍 {event.content_data.location}</span>
                )}
              </div>
            </div>

            <EventRegistrationForm
              eventId={event.id}
              eventTitle={event.title}
              maxAttendees={event.content_data.max_attendees}
              currentAttendees={currentAttendees}
              registrationDeadline={event.content_data.registration_deadline}
              customFields={event.content_data.custom_fields}
            />
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default EventRegistration;
