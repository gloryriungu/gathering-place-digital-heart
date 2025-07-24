
import { MapPin, Phone, Mail, Facebook, Instagram, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Church Info */}
          <div className="lg:col-span-2">
            <h3 className="text-3xl md:text-4xl font-black mb-6">TOT INTERNATIONAL</h3>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-md">
              Raising champions for Christ through sound biblical teaching, authentic worship, and transformational encounters with God.
            </p>
            <div className="flex space-x-6">
              <Facebook className="h-8 w-8 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Instagram className="h-8 w-8 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Youtube className="h-8 w-8 text-gray-400 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-black text-xl mb-6">CONTACT US</h4>
            <div className="space-y-4 text-gray-300">
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-3" />
                <span>+254 700 000 000</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-3" />
                <span>info@tot.co.ke</span>
              </div>
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 mt-0.5" />
                <span>Nairobi, Kenya<br />East Africa</span>
              </div>
            </div>
          </div>

          {/* Service Times */}
          <div>
            <h4 className="font-black text-xl mb-6">SERVICE TIMES</h4>
            <div className="space-y-4 text-gray-300">
              <div>
                <div className="font-bold text-white mb-2">SUNDAY</div>
                <div className="space-y-1">
                  <div className="font-bold text-white">9:00 AM - First Service</div>
                  <div className="font-bold text-white">11:00 AM - Second Service</div>
                </div>
              </div>
              <div>
                <div className="font-bold text-white mb-2">WEDNESDAY</div>
                <div>7:00 PM - Bible Study</div>
              </div>
              <div>
                <div className="font-bold text-white mb-2">FRIDAY</div>
                <div>7:00 PM - Prayer Night</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              &copy; 2024 TOT International. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
