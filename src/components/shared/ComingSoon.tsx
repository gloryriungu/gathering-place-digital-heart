import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

interface ComingSoonProps {
  title?: string;
}

export const ComingSoon = ({ title }: ComingSoonProps) => (
  <div className="min-h-screen flex flex-col bg-background">
    <Navigation />
    <main className="flex-1 flex items-center justify-center px-6 pt-32 pb-20">
      <div className="max-w-xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Clock className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          {title ? `${title} is launching soon` : "This service is launching soon"}
        </h1>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          We are preparing this experience for our church family. Please check back
          shortly — in the meantime we would love to welcome you at a service.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link to="/">Return to homepage</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/visit-us">Plan your visit</Link>
          </Button>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default ComingSoon;
