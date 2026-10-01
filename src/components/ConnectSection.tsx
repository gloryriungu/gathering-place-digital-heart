/**
 * ConnectSection Component
 *
 * Homepage section showcasing connection opportunities.
 * Restyled to the plum / amber / Playfair design system.
 */

import { Button } from "@/components/ui/button";
import { Users, Heart, HandHeart, MessageCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const ConnectSection = () => {
  const connectOptions = [
    {
      icon: Users,
      title: "Life Groups",
      description: "Connect with other believers in intimate small groups for fellowship, prayer, and spiritual growth.",
      action: "Join a Group",
      link: "/ministries",
    },
    {
      icon: HandHeart,
      title: "Serve Teams",
      description: "Use your gifts and talents to serve God and others through various ministry opportunities.",
      action: "Start Serving",
      link: "/serve-with-us",
    },
    {
      icon: Heart,
      title: "Prayer Ministry",
      description: "Experience the power of prayer and intercession through our dedicated prayer teams and warriors.",
      action: "Join Prayer",
      link: "/ministries",
    },
    {
      icon: MessageCircle,
      title: "Discipleship",
      description: "Grow deeper in your faith through mentorship, Bible study, and spiritual formation programs.",
      action: "Get Discipled",
      link: "/ministries",
    },
  ];

  return (
    <section className="relative py-20 md:py-28 bg-background overflow-hidden">
      {/* Watermark */}
      <span
        aria-hidden
        className="pointer-events-none select-none absolute -top-4 left-1/2 -translate-x-1/2 font-display font-bold uppercase tracking-tight text-[18vw] leading-none text-primary/[0.04]"
      >
        Connect
      </span>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="eyebrow mb-3">Find Your Place</p>
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            More Than a Church, <span className="text-accent italic">We're Family</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover your place in our community and grow in your relationship with God and with others.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {connectOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <div
                key={option.title}
                className="card-lift group flex flex-col rounded-2xl bg-card border border-border overflow-hidden"
              >
                <div className="bg-gradient-plum px-6 py-7 flex flex-col items-center text-center">
                  <span className="h-14 w-14 rounded-full bg-gradient-amber flex items-center justify-center text-accent-foreground mb-4 transition-transform duration-300 group-hover:scale-110">
                    <IconComponent className="h-6 w-6" />
                  </span>
                  <h3 className="text-sm font-sans font-bold tracking-[0.2em] uppercase text-primary-foreground">
                    {option.title}
                  </h3>
                </div>
                <div className="flex-1 px-6 py-6 text-center">
                  <p className="text-muted-foreground leading-relaxed">{option.description}</p>
                </div>
                <div className="px-6 pb-6">
                  <Button asChild className="w-full">
                    <Link to={option.link}>
                      {option.action}
                      <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 rounded-2xl border-2 border-accent bg-card p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-5 justify-between">
          <div>
            <p className="eyebrow mb-1">New Here?</p>
            <p className="font-display text-xl font-bold text-primary">
              Let us welcome you personally on your first visit
            </p>
            <p className="text-muted-foreground">We'll save you a seat and introduce you to the family.</p>
          </div>
          <Button asChild size="lg" className="shrink-0">
            <Link to="/visit-us">
              Plan Your Visit <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ConnectSection;
