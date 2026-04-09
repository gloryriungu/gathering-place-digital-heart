import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const DEFAULT_CONTENT = {
  title: "Terms of Service",
  last_updated: "April 2025",
  body: `<div class="space-y-6">
<h2 class="text-2xl font-bold">1. Acceptance of Terms</h2>
<p>By accessing and using the TOT International website and services, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>

<h2 class="text-2xl font-bold">2. Use of Services</h2>
<p>Our website and services are provided for the purpose of:</p>
<ul class="list-disc pl-6 space-y-2">
<li>Church community engagement and communication</li>
<li>Online giving and donations</li>
<li>Event registration and participation</li>
<li>Access to sermons, teachings, and church resources</li>
<li>Counseling and pastoral care booking</li>
</ul>

<h2 class="text-2xl font-bold">3. User Accounts</h2>
<p>When you create an account, you are responsible for maintaining the confidentiality of your credentials and for all activities under your account. You agree to provide accurate and complete information during registration.</p>

<h2 class="text-2xl font-bold">4. Giving and Donations</h2>
<p>All financial contributions made through our platform are processed securely via Paystack. Donations are voluntary and non-refundable unless otherwise required by law. You will receive confirmation for all transactions.</p>

<h2 class="text-2xl font-bold">5. Content and Intellectual Property</h2>
<p>All content on this website, including sermons, articles, images, and media, is the property of TOT International and is protected by copyright laws. You may not reproduce or distribute content without written permission.</p>

<h2 class="text-2xl font-bold">6. User Conduct</h2>
<p>You agree not to:</p>
<ul class="list-disc pl-6 space-y-2">
<li>Use the services for any unlawful purpose</li>
<li>Attempt to gain unauthorized access to any part of the platform</li>
<li>Interfere with or disrupt the services</li>
<li>Submit false or misleading information</li>
</ul>

<h2 class="text-2xl font-bold">7. Limitation of Liability</h2>
<p>TOT International shall not be liable for any indirect, incidental, or consequential damages arising from your use of our services.</p>

<h2 class="text-2xl font-bold">8. Changes to Terms</h2>
<p>We reserve the right to modify these terms at any time. Continued use of the services after changes constitutes acceptance of the updated terms.</p>

<h2 class="text-2xl font-bold">9. Governing Law</h2>
<p>These terms are governed by the laws of Kenya. Any disputes shall be resolved through the courts of Kenya.</p>

<h2 class="text-2xl font-bold">10. Contact</h2>
<p>For questions about these Terms of Service, please contact us at info@tot.co.ke.</p>
</div>`,
};

const TermsOfService = () => {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data: rows, error } = await supabase
          .from("page_content")
          .select("section_name, content")
          .eq("page_name", "terms_of_service")
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
        title="Terms of Service | TOT International"
        description="Read the terms and conditions for using TOT International's website and services."
        url="/terms-of-service"
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

export default TermsOfService;
