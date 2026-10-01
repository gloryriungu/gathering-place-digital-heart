/**
 * GivingSection Component
 *
 * Homepage section explaining how tithes and offerings are used.
 * Restyled to the plum / amber / Playfair design system.
 */

import { Button } from "@/components/ui/button";
import { Heart, DollarSign, Target, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const GivingSection = () => {
  const givingImpact = [
    {
      number: "01",
      icon: Users,
      title: "Missions",
      description: "Supporting global missions and church planting initiatives.",
      percentage: "35%",
    },
    {
      number: "02",
      icon: Target,
      title: "Ministry",
      description: "Funding life-changing ministry programs and events.",
      percentage: "30%",
    },
    {
      number: "03",
      icon: Heart,
      title: "Community",
      description: "Caring for the needy and community outreach programs.",
      percentage: "20%",
    },
    {
      number: "04",
      icon: DollarSign,
      title: "Operations",
      description: "Church facilities, staff, and operational expenses.",
      percentage: "15%",
    },
  ];

  return (
    <section className="relative py-20 md:py-28 bg-gradient-plum text-primary-foreground overflow-hidden">
      {/* Geometric accents */}
      <span
        aria-hidden
        className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full border border-accent/20"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-28 bottom-0 h-96 w-96 rounded-full border border-accent/10"
      />
      <span
        aria-hidden
        className="pointer-events-none select-none absolute -top-4 left-1/2 -translate-x-1/2 font-display font-bold uppercase text-[18vw] leading-none text-primary-foreground/[0.05]"
      >
        Giving
      </span>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="eyebrow mb-3">Generosity &amp; Kingdom Impact</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Partner With the <span className="text-accent italic">Mission</span>
          </h2>
          <p className="text-lg text-primary-foreground/75 max-w-2xl mx-auto">
            Your faithful giving enables us to raise champions for Christ and expand God's kingdom around the world.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-12">
          {givingImpact.map((impact) => {
            const IconComponent = impact.icon;
            return (
              <div key={impact.title} className="glass-card card-lift relative p-7 overflow-hidden">
                <span
                  aria-hidden
                  className="absolute -top-3 right-3 font-display font-bold text-6xl text-accent/15 select-none"
                >
                  {impact.number}
                </span>
                <span className="h-12 w-12 rounded-full bg-gradient-amber flex items-center justify-center text-accent-foreground mb-5">
                  <IconComponent className="h-5 w-5" />
                </span>
                <div className="font-display text-4xl font-bold text-accent mb-1">{impact.percentage}</div>
                <h3 className="text-sm font-sans font-bold tracking-[0.2em] uppercase mb-3">{impact.title}</h3>
                <p className="text-sm leading-relaxed text-primary-foreground/70">{impact.description}</p>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border-2 border-accent/60 bg-primary-foreground/5 backdrop-blur-md p-8 md:p-10 text-center">
          <h3 className="font-display text-3xl md:text-4xl font-bold mb-4">Ready to Give?</h3>
          <p className="text-primary-foreground/75 max-w-2xl mx-auto mb-8 leading-relaxed">
            Join us in partnership as we advance God's kingdom. Every seed you sow makes an eternal difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/give">
                <Heart className="h-5 w-5 mr-2" />
                Give Now
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-2 border-accent bg-transparent text-primary-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Link to="/give">
                Learn About Giving
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GivingSection;
