import { Button } from "@/components/ui/button";
import { MapPin, Video, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Row = ({ time, label }: { time: string; label: string }) => (
  <div className="flex items-baseline gap-3 py-3">
    <span className="font-display text-xl font-bold text-primary whitespace-nowrap">{time}</span>
    <span className="flex-1 border-b-2 border-dotted border-border translate-y-[-4px]" />
    <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">{label}</span>
  </div>
);

const ScheduleCard = ({
  icon: Icon, title, subtitle, rows, cta, to,
}: {
  icon: typeof MapPin; title: string; subtitle: string;
  rows: { time: string; label: string }[]; cta: string; to: string;
}) => (
  <div className="card-lift rounded-2xl bg-card border border-border overflow-hidden flex flex-col">
    <div className="bg-gradient-plum text-primary-foreground px-6 py-5 flex items-center gap-4">
      <span className="h-11 w-11 rounded-full bg-gradient-amber flex items-center justify-center text-accent-foreground">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <h3 className="text-sm font-sans font-bold tracking-[0.2em] uppercase">{title}</h3>
        <p className="text-sm text-primary-foreground/70">{subtitle}</p>
      </div>
    </div>
    <div className="px-6 py-4 flex-1">
      {rows.map((r) => <Row key={r.time + r.label} {...r} />)}
    </div>
    <div className="px-6 pb-6">
      <Button asChild className="w-full">
        <Link to={to}>{cta} <ArrowRight className="h-4 w-4 ml-2" /></Link>
      </Button>
    </div>
  </div>
);

export const ServiceTimes = () => (
  <section className="py-20 md:py-28 bg-lavender">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-14">
        <p className="eyebrow mb-3">Service Schedule</p>
        <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
          Come Worship <span className="text-accent italic">With Us</span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Experience God's presence through powerful worship, life-changing messages and genuine fellowship.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <ScheduleCard icon={MapPin} title="In-Person Services" subtitle="TOT International Church"
          rows={[
            { time: "9:00 AM", label: "Sunday · First Service" },
            { time: "11:00 AM", label: "Sunday · Second Service" },
            { time: "7:00 PM", label: "Wednesday · Bible Study" },
          ]}
          cta="Plan Your Visit" to="/visit-us" />
        <ScheduleCard icon={Video} title="Online Worship" subtitle="Join from anywhere in the world"
          rows={[
            { time: "9:00 AM", label: "Sunday · Live Stream" },
            { time: "11:00 AM", label: "Sunday · Live Stream" },
            { time: "Anytime", label: "Previous Messages" },
          ]}
          cta="Watch Online" to="/watch" />
      </div>

      <div className="rounded-2xl border-2 border-accent bg-card p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-5 justify-between">
        <div className="flex items-start gap-4">
          <span className="h-12 w-12 shrink-0 rounded-full bg-secondary flex items-center justify-center text-primary">
            <MapPin className="h-6 w-6" />
          </span>
          <div>
            <p className="eyebrow mb-1">Location</p>
            <p className="font-display text-xl font-bold text-primary">1st Floor, Nissan Kenya Showroom Building</p>
            <p className="text-muted-foreground">Uhuru Highway, Nairobi</p>
          </div>
        </div>
        <Button asChild variant="outline" className="shrink-0">
          <Link to="/visit-us">Get Directions <ArrowRight className="h-4 w-4 ml-2" /></Link>
        </Button>
      </div>
    </div>
  </section>
);
