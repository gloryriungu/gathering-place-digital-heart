
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Youtube } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Church Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">TOT Int</h3>
            <p className="opacity-90 mb-4">
              Transforming lives through God's Word and building a community where everyone belongs.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 opacity-75 hover:opacity-100 cursor-pointer" />
              <Instagram className="h-5 w-5 opacity-75 hover:opacity-100 cursor-pointer" />
              <Youtube className="h-5 w-5 opacity-75 hover:opacity-100 cursor-pointer" />
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className="space-y-3 text-sm opacity-90">
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <span>info@totint.org</span>
              </div>
              <div className="flex items-start">
                <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                <span>123 Faith Avenue<br />Downtown, ST 12345</span>
              </div>
            </div>
          </div>

          {/* Service Times */}
          <div>
            <h4 className="font-semibold mb-4">Service Times</h4>
            <div className="space-y-3 text-sm opacity-90">
              <div>
                <div className="font-medium">Sunday Services</div>
                <div>9:00 AM - First Service</div>
                <div>11:00 AM - Main Service</div>
                <div>6:00 PM - Evening Service</div>
              </div>
              <div>
                <div className="font-medium">Wednesday</div>
                <div>7:00 PM - Bible Study</div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2 text-sm opacity-90">
              <div><a href="#" className="hover:opacity-100">About Us</a></div>
              <div><a href="#" className="hover:opacity-100">Messages</a></div>
              <div><a href="#" className="hover:opacity-100">Events</a></div>
              <div><a href="#" className="hover:opacity-100">Small Groups</a></div>
              <div><a href="#" className="hover:opacity-100">Give Online</a></div>
              <div><a href="#" className="hover:opacity-100">Prayer Requests</a></div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm opacity-75">
          <p>&copy; 2024 TOT Int. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
