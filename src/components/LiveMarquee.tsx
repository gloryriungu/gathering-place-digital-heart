import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const items = Array.from({ length: 8 });

export const LiveMarquee = () => (
  <div className="bg-lavender border-y border-border overflow-hidden py-3" aria-label="Live every Sunday">
    <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
      {[0, 1].map((half) => (
        <div key={half} className="flex items-center gap-8 pr-8" aria-hidden={half === 1}>
          {items.map((_, i) => (
            <div key={i} className="flex items-center gap-4 whitespace-nowrap">
              <Link
                to="/watch"
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-amber px-4 py-1.5 text-xs font-bold tracking-wider text-accent-foreground transition-transform hover:scale-105"
              >
                JOIN THE STREAM <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <span className="text-sm font-semibold tracking-[0.15em] text-primary">
                LIVE EVERY SUNDAY · 9:00 AM &amp; 11:00 AM
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);
