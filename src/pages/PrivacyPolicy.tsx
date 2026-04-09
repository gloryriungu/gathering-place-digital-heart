import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const DEFAULT_CONTENT = {
  title: "Privacy Policy",
  last_updated: "April 2025",
  body: `<div class="space-y-6">
<h2 class="text-2xl font-bold">1. Introduction</h2>
<p>TOT International ("we", "our", or "us") is committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.</p>

<h2 class="text-2xl font-bold">2. Information We Collect</h2>
<p>We may collect information that you provide directly to us, including:</p>
<ul class="list-disc pl-6 space-y-2">
<li>Personal identification information (name, email address, phone number)</li>
<li>Demographic information (county, occupation, date of birth)</li>
<li>Church-related information (membership status, ministry involvement)</li>
<li>Financial information for giving and donations (processed securely via Paystack)</li>
<li>Communication preferences</li>
</ul>

<h2 class="text-2xl font-bold">3. How We Use Your Information</h2>
<p>We use the information we collect to:</p>
<ul class="list-disc pl-6 space-y-2">
<li>Facilitate church membership and community engagement</li>
<li>Process donations and financial contributions</li>
<li>Send communications about church events and updates (with your consent)</li>
<li>Provide counseling and pastoral care services</li>
<li>Improve our website and services</li>
</ul>

<h2 class="text-2xl font-bold">4. Data Protection</h2>
<p>In accordance with the Kenya Data Protection Act, 2019, we implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.</p>

<h2 class="text-2xl font-bold">5. Your Rights</h2>
<p>You have the right to:</p>
<ul class="list-disc pl-6 space-y-2">
<li>Access your personal data</li>
<li>Correct inaccurate data</li>
<li>Request deletion of your data</li>
<li>Withdraw consent for communications</li>
<li>Lodge a complaint with the Office of the Data Protection Commissioner</li>
</ul>

<h2 class="text-2xl font-bold">6. Cookies</h2>
<p>We use cookies and similar technologies to enhance your experience. You can manage your cookie preferences through our cookie consent banner.</p>

<h2 class="text-2xl font-bold">7. Contact Us</h2>
<p>If you have questions about this Privacy Policy, please contact us at info@tot.co.ke.</p>
</div>`,
};

const PrivacyPolicy = () => {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data: rows, error } = await supabase
          .from("page_content")
          .select("section_name, content")
          .eq("page_name", "privacy_policy")
          .eq("is_published", true);

        if (!error && rows && rows.length > 0) {
          const mapped: Partial<typeof DEFAULT_CONTENT> = {};
          rows.forEach((row) => {
            const key = row.section_name as keyof typeof DEFAULT_CONTENT;
            if (key in DEFAULT_CONTENT) {
              (mapped as any)[key] = row.content;
            }
          });
          setContent((prev) => ({ ...prev, ...mapped }));
        }
      } catch {
        // fall back to defaults
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Privacy Policy | TOT International"
        description="Learn how TOT International collects, uses, and protects your personal information."
        canonical="/privacy-policy"
      />
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-96 w-full" />
          </div>
        ) : (
          <>
            <h1 className="text-4xl md:text-5xl font-black text-foreground mb-2">
              {content.title}
            </h1>
            <p className="text-muted-foreground mb-10">
              Last updated: {content.last_updated}
            </p>
            <div
              className="prose prose-lg max-w-none text-foreground/90"
              dangerouslySetInnerHTML={{ __html: content.body }}
            />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
