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
    story_content: "TOT International was founded with a divine vision to raise champions for Christ who will transform nations through the power of God's Word...",
    story_image_url: "",
    vision_text: "To raise champions for Christ who will transform nations through the power of God's Word and the demonstration of His love.",
    mission_text: "To provide sound biblical teaching, authentic worship, and transformational encounters with God that equip believers for victorious living and effective ministry.",
    beliefs: [
      { title: "The Authority of Scripture", content: "We believe the Bible is the inspired, infallible, and authoritative Word of God..." },
      { title: "Salvation by Grace", content: "We believe salvation is a gift from God through faith in Jesus Christ..." },
      { title: "The Power of the Holy Spirit", content: "We believe in the baptism of the Holy Spirit and the operation of spiritual gifts..." }
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
        <section className="relative bg-black text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-black mb-6">{content.hero_title}</h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto">
                {content.hero_subtitle}
              </p>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">{content.story_title}</h2>
                <div className="text-lg text-gray-700 whitespace-pre-line">
                  {content.story_content}
                </div>
              </div>
              <div className="h-96 rounded-lg overflow-hidden">
                {content.story_image_url ? (
                  <img 
                    src={content.story_image_url} 
                    alt="Church Ministry" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="bg-gray-100 h-full flex items-center justify-center">
                    <p className="text-gray-500">Church Ministry Photo</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Our Beliefs */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">What We Believe</h2>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                Our faith is anchored on the unchanging Word of God and the transformative power of Jesus Christ.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {content.beliefs.map((belief, index) => (
                <div key={index} className="text-center">
                  <h3 className="text-xl font-bold text-black mb-4">{belief.title}</h3>
                  <p className="text-gray-700">{belief.content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Leadership */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Our Leadership</h2>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                God has raised up anointed leaders to guide and shepherd our church family with wisdom, love, and biblical truth.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {content.leadership.map((leader, index) => (
                <div key={index} className="text-center">
                  <div className="bg-gray-100 h-64 w-64 mx-auto rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                    {leader.image_url ? (
                      <img 
                        src={leader.image_url} 
                        alt={leader.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <p className="text-gray-500">{leader.name}</p>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-black mb-2">{leader.name}</h3>
                  <p className="text-gray-700">{leader.position}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="py-20 bg-black text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">OUR VISION</h2>
                <p className="text-lg text-gray-300 leading-relaxed">
                  {content.vision_text}
                </p>
              </div>
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">OUR MISSION</h2>
                <p className="text-lg text-gray-300 leading-relaxed">
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
