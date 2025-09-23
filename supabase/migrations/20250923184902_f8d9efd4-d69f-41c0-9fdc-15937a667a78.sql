-- Ensure the ticket number trigger is properly set up
DROP TRIGGER IF EXISTS set_ticket_number_trigger ON public.support_tickets;

CREATE TRIGGER set_ticket_number_trigger
  BEFORE INSERT ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.set_ticket_number();