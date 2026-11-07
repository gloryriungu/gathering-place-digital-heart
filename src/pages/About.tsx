/**
 * ABOUT US PAGE - CHURCH INFORMATION & LEADERSHIP
 * 
 * LANGUAGE/FRAMEWORK: TypeScript + React (TSX)
 * - TypeScript: Defines interfaces for structured content data
 * - React: Component-based framework for building the page
 * - React Hooks: useState and useEffect for state and data fetching
 * 
 * FUNCTIONALITY:
 * Comprehensive "About Us" page that presents the church's identity and leadership:
 * - Hero Section: Displays main title and subtitle about the church's mission
 * - Our Story: Narrative about the church's founding and history with optional image
 * - Our Beliefs: Core theological beliefs and doctrinal positions (displays 3 key beliefs)
 * - Leadership Team: Profiles of pastors and church leaders with photos and positions
 * - Vision & Mission: Church's vision and mission statements prominently displayed
 * 
 * DATA MANAGEMENT:
 * - Fetches dynamic content from Supabase 'page_content' table
 * - Falls back to default static content if database fetch fails
 * - Parses JSON fields for beliefs and leadership arrays
 * - Only displays published content (is_published = true)
 * - Shows loading spinner while content is being fetched
 * 
 * SEO OPTIMIZATION:
 * - Includes SEO component with structured data for AboutPage schema
 * - Canonical URL and meta descriptions
 * - Keywords for search engine optimization
 * - Schema.org markup for better search engine understanding
 * 
 * CONTENT STRUCTURE:
 * - All text content is editable through the admin dashboard
 * - Supports image uploads for story section and leadership profiles
 * - Flexible beliefs and leadership arrays can be extended
 */
import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";

interface AboutContent {
  hero_title: string;
  hero_subtitle: string;
  story_title: string;
  story_content: string;
  story_image_url?: string;
  vision_text: string;
  mission_text: string;
  beliefs: Array<{ title: string; content: string }>;
  leadership: Array<{ name: string; position: string; image_url?: string }>;
}

const About = () => {
  const [content, setContent] = useState<AboutContent>({
    hero_title: "ABOUT TOT INTERNATIONAL",
    hero_subtitle: "A ministry committed to raising champions for Christ through sound biblical teaching, authentic worship, and transformational encounters with God.",
    story_title: "Our Story",
    story_content: "Established in 2017, Tent of Testimonies Ministries International (TOT) is the principal church ministry within Tushiyah Ministry, a Christian ministry network advancing the Gospel of Jesus Christ.\n\nTOT’s work includes worship, prayer, preaching, evangelism, discipleship, prophetic ministry and biblical teaching. The wider network connects local branches, international fellowships, youth ministries and independent churches under spiritual oversight.\n\nComplementary initiatives extend this work through Christian broadcasting, biblical training and youth development.",
    story_image_url: "",
    vision_text: "To raise champions for Christ who will transform nations through the power of God's Word and the demonstration of His love.",
    mission_text: "To provide sound biblical teaching, authentic worship, and transformational encounters with God that equip believers for victorious living and effective ministry.",
    beliefs: [
      { title: "The Gospel of Jesus Christ", content: "We are committed to advancing the Gospel through preaching, evangelism and ministry." },
      { title: "Biblical Teaching & Discipleship", content: "We serve through biblical teaching and discipleship, supporting Christian faith and spiritual development." },
      { title: "Worship, Prayer & Prophetic Ministry", content: "Worship, prayer and prophetic ministry are central areas of the ministry’s service." }
    ],
    leadership: [
      { name: "Pastor Timothy Kitui", position: "Senior Pastor & Founder" },
      { name: "Associate Pastor", position: "Teaching & Discipleship" },
      { name: "Worship Pastor", position: "Music & Creative Arts" }
    ]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAboutContent();
  }, []);

  const fetchAboutContent = async () => {
    try {
      const { data } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_name', 'about')
        .eq('is_published', true);

      if (data && data.length > 0) {
        const contentMap: any = {};
        data.forEach(item => {
          // Parse JSON fields back to arrays
          if (item.section_name === 'beliefs' || item.section_name === 'leadership') {
            try {
              contentMap[item.section_name] = JSON.parse(item.content);
            } catch {
              // Keep default values if parsing fails
            }
          } else {
            contentMap[item.section_name] = item.content;
          }
        });
        
        if (Object.keys(contentMap).length > 0) {
          setContent(prev => ({ ...prev, ...contentMap }));
        }
      }
    } catch (error) {
      console.error('Error fetching about content:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About TOT International",
    "description": content.hero_subtitle,
    "mainEntity": {
      "@type": "Church",
      "name": "TOT International",
      "description": content.story_content.substring(0, 200)
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="About Us"
        description={content.hero_subtitle}
        canonical="/about"
        keywords="about TOT International, church mission, church vision, church beliefs, church leadership"
        structuredData={aboutSchema}
      />
      <Navigation />
      <div className="pt-20">
        {/* Hero Section */}
        <section className="relative bg-gradient-plum text-cream py-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">{content.hero_title}</h1>
              <p className="text-xl md:text-2xl text-cream/80 max-w-4xl mx-auto">
                {content.hero_subtitle}
              </p>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16 sm:py-20 lg:py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-16 items-center">
              <div className="max-w-2xl">
                <p className="eyebrow mb-4">Established in 2017 · Tushiyah Ministry</p>
                <h2 className="font-display text-4xl sm:text-5xl font-bold text-primary mb-6">{content.story_title}</h2>
                <div className="text-base sm:text-lg text-muted-foreground leading-8 whitespace-pre-line">
                  {content.story_content}
                </div>
              </div>
              <div className="aspect-[4/3] overflow-hidden rounded-md border border-border bg-muted">
                {content.story_image_url ? (
                  <img 
                    src={content.story_image_url} 
                    alt="Tent of Testimonies Ministries International"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="relative flex h-full flex-col justify-between overflow-hidden bg-gradient-plum p-7 sm:p-10 text-primary-foreground">
                    <span className="eyebrow text-accent">Our ministry</span>
                    <span aria-hidden="true" className="absolute -right-3 top-1/2 -translate-y-1/2 font-display text-[12rem] font-bold leading-none text-primary-foreground/10 sm:text-[16rem]">TOT</span>
                    <div className="relative z-10">
                      <p className="font-display text-3xl sm:text-4xl font-bold">Tent of Testimonies</p>
                      <p className="mt-3 max-w-sm text-sm sm:text-base text-primary-foreground/80">The Home of Supernatural Divine Solutions</p>
                      <p className="mt-8 text-sm font-semibold text-accent">Established 2017</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-14 border-y border-border py-8 sm:py-10">
              <div className="grid gap-7 sm:grid-cols-3 sm:gap-4">
                <div className="sm:border-r sm:border-border sm:pr-5">
                  <p className="font-display text-4xl font-bold text-primary">18</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">Church branches</p>
                </div>
                <div className="sm:border-r sm:border-border sm:px-5">
                  <p className="font-display text-4xl font-bold text-primary">6</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">Countries with branches</p>
                </div>
                <div className="sm:pl-5">
                  <p className="font-display text-4xl font-bold text-primary">5</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">International fellowship locations</p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-6 text-muted-foreground">Fellowships are identified in Sierra Leone, Europe, Canada, the United States and the Middle East.</p>
            </div>

          </div>
        </section>

        {/* Our Beliefs */}
        <section className="py-16 sm:py-20 lg:py-24 bg-primary text-primary-foreground">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10 max-w-3xl">
              <p className="eyebrow mb-4">Our foundation</p>
              <h2 className="font-display text-4xl sm:text-5xl font-bold mb-4">What We Believe</h2>
              <p className="text-base sm:text-lg leading-8 text-primary-foreground/80">
                Our faith is expressed through the ministry’s commitments: advancing the Gospel, serving through prayer and worship, and growing through biblical teaching and discipleship.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
              {content.beliefs.map((belief, index) => (
                <div key={index} className="rounded-md border border-primary-foreground/15 bg-primary-foreground/5 p-6 sm:p-8">
                  <p className="mb-8 text-sm font-bold text-accent">0{index + 1}</p>
                  <div className="mb-5 h-px w-12 bg-accent" />
                  <h3 className="font-display text-xl sm:text-2xl font-bold leading-snug">{belief.title}</h3>
                  <p className="mt-4 text-sm sm:text-base leading-7 text-primary-foreground/75">{belief.content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Leadership */}
        <section className="py-20 bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">Our Leadership</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                God has raised up anointed leaders to guide and shepherd our church family with wisdom, love, and biblical truth.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {content.leadership.map((leader, index) => (
                <div key={index} className="text-center">
                  <div className="bg-lavender h-64 w-64 mx-auto rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                    {leader.image_url ? (
                      <img 
                        src={leader.image_url} 
                        alt={leader.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <p className="text-muted-foreground">{leader.name}</p>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-2">{leader.name}</h3>
                  <p className="text-muted-foreground">{leader.position}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="py-20 bg-gradient-plum text-cream">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="text-center">
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">OUR VISION</h2>
                <p className="text-lg text-cream/80 leading-relaxed">
                  {content.vision_text}
                </p>
              </div>
              <div className="text-center">
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">OUR MISSION</h2>
                <p className="text-lg text-cream/80 leading-relaxed">
                  {content.mission_text}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default About;
