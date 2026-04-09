/**
 * Footer Component
 * 
 * Language: TypeScript + React
 * 
 * Purpose:
 * - Site-wide footer with church information and navigation
 * - Displays contact details, service times, and social media links
 * - Provides copyright and developer attribution
 * 
 * Key Features:
 * - Dynamic social media links from Supabase
 * - Contact information (phone, email, location)
 * - Service times for Sunday and weekday meetings
 * - Privacy policy and terms of service links
 * - Responsive multi-column layout
 */

import { useState, useEffect } from "react";
import { MapPin, Phone, Mail } from "lucide-react";
import { useSocialMedia } from "@/hooks/useSocialMedia";
import { supabase } from "@/integrations/supabase/client";

interface ServiceTime {
  day: string;
  times: string[];
}

interface FooterData {
  church_name: string;
  church_description: string;
  phone: string;
  email: string;
  location: string;
  service_times: ServiceTime[];
  privacy_policy_url: string;
  terms_url: string;
  contact_url: string;
  copyright_text: string;
}

const DEFAULTS: FooterData = {
  church_name: "TOT INTERNATIONAL",
  church_description: "Raising champions for Christ through sound biblical teaching, authentic worship, and transformational encounters with God.",
  phone: "+254 700 000 000",
  email: "info@tot.co.ke",
  location: "Nairobi, Kenya\nEast Africa",
  service_times: [
    { day: "SUNDAY", times: ["9:00 AM - First Service", "11:00 AM - Second Service"] },
    { day: "WEDNESDAY", times: ["7:00 PM - Bible Study"] },
    { day: "FRIDAY", times: ["7:00 PM - Prayer Night"] },
  ],
  privacy_policy_url: "/privacy-policy",
  terms_url: "/terms-of-service",
  contact_url: "#",
  copyright_text: "© 2025 TOT International. All rights reserved.",
};

export const Footer = () => {
  const { socialLinks } = useSocialMedia();
  const [data, setData] = useState<FooterData>(DEFAULTS);

  useEffect(() => {
    const fetchFooter = async () => {
      try {
        const { data: rows, error } = await supabase
          .from("page_content")
          .select("section_name, content")
          .eq("page_name", "footer")
          .eq("is_published", true);

        if (error || !rows || rows.length === 0) return;

        const mapped: Partial<FooterData> = {};
        rows.forEach((row) => {
          const key = row.section_name as keyof FooterData;
          if (key === "service_times") {
            try {
              mapped[key] = JSON.parse(row.content);
            } catch {
              // keep default
            }
          } else if (key in DEFAULTS) {
            (mapped as any)[key] = row.content;
          }
        });
        setData((prev) => ({ ...prev, ...mapped }));
      } catch {
        // silently fall back to defaults
      }
    };
    fetchFooter();
  }, []);

  const locationLines = data.location.split("\n");

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Church Info */}
          <div className="lg:col-span-2">
            <h3 className="text-3xl md:text-4xl font-black mb-6">{data.church_name}</h3>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-md">{data.church_description}</p>
            <div className="flex space-x-6">
              {socialLinks.map((social) => (
                <a key={social.platform} href={social.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white cursor-pointer transition-colors" aria-label={social.platform}>
                  <social.icon className="h-8 w-8" />
                </a>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-black text-xl mb-6">CONTACT US</h4>
            <div className="space-y-4 text-gray-300">
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-3" />
                <span>{data.phone}</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-3" />
                <span>{data.email}</span>
              </div>
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 mt-0.5" />
                <span>
                  {locationLines.map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < locationLines.length - 1 && <br />}
                    </span>
                  ))}
                </span>
              </div>
            </div>
          </div>

          {/* Service Times */}
          <div>
            <h4 className="font-black text-xl mb-6">SERVICE TIMES</h4>
            <div className="space-y-4 text-gray-300">
              {data.service_times.map((service, i) => (
                <div key={i}>
                  <div className="font-bold text-white mb-2">{service.day}</div>
                  <div className="space-y-1">
                    {service.times.map((time, j) => (
                      <div key={j} className="font-bold text-white">{time}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col items-center mb-4 md:mb-0 md:flex md:items-end md:justify-end">
              <p className="text-gray-400 text-sm">{data.copyright_text}</p>
              <p className="text-gray-500 text-xs mt-1">
                Created by{" "}
                <a href="https://nafarrosolutions.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors underline">
                  nafarrosolutions.com
                </a>
              </p>
            </div>
            <div className="flex space-x-6 text-sm">
              <a href={data.privacy_policy_url} className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href={data.terms_url} className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              <a href={data.contact_url} className="text-gray-400 hover:text-white transition-colors">Contact Us</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
