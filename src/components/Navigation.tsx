
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, ShoppingCart, Facebook, Instagram, Youtube, Music2, MessageCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState(0);

  const navItems = [
    { name: "ABOUT", href: "/about" },
    { name: "WATCH", href: "/watch" },
    { name: "EVENTS", href: "/events" },
    { name: "GIVE", href: "/give" },
    { name: "SHOP", href: "/shop" },
    { name: "LOG IN", href: "/login" },
  ];

  const getInvolvedItems = [
    { name: "JOIN THE FAMILY", href: "#" },
    { name: "SERVE WITH US", href: "#" },
    { name: "BAPTISM", href: "#" },
    { name: "MINISTRIES", href: "#" },
    { name: "COUNSELING & MENTAL HEALTH", href: "#" },
    { name: "PARTNERS", href: "#" },
    { name: "BABY DEDICATIONS", href: "#" },
    { name: "PROPHETIC SCHOOL", href: "#" },
    { name: "NEWSLETTER", href: "#" },
    { name: "NOTICE OF FILMING", href: "#" },
    { name: "FAQ", href: "#" },
  ];

  const socialLinks = [
    { name: "Facebook", href: "https://facebook.com/totinternational", icon: Facebook },
    { name: "Instagram", href: "https://instagram.com/totinternational", icon: Instagram },
    { name: "YouTube", href: "https://youtube.com/totinternational", icon: Youtube },
    { name: "Spotify", href: "https://spotify.com/totinternational", icon: Music2 },
    { name: "TikTok", href: "https://tiktok.com/@totinternational", icon: MessageCircle },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/">
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">TOT INT</h1>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-white hover:text-gray-300 font-bold text-sm tracking-wide transition-colors"
              >
                {item.name}
              </a>
            ))}
            
            {/* Get Involved Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-white hover:text-gray-300 font-bold text-sm tracking-wide transition-colors flex items-center gap-1">
                  GET INVOLVED
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black/95 backdrop-blur-md border-white/10 z-50">
                {getInvolvedItems.map((item) => (
                  <DropdownMenuItem key={item.name} asChild>
                    <a
                      href={item.href}
                      className="text-white hover:text-gray-300 font-bold text-sm tracking-wide cursor-pointer"
                    >
                      {item.name}
                    </a>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-gray-300 transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>

            {/* Cart Icon */}
            <div className="relative">
              <a href="/shop" className="text-white hover:text-gray-300 transition-colors">
                <ShoppingCart className="h-5 w-5" />
                {cartItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItems}
                  </span>
                )}
              </a>
            </div>
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button className="bg-white text-black hover:bg-gray-100 font-bold" asChild>
              <a href="/visit-us">VISIT US</a>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-white"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-md">
            <div className="px-2 pt-2 pb-6 space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-3 text-white hover:text-gray-300 font-bold text-lg tracking-wide"
                >
                  {item.name}
                </a>
              ))}
              
              {/* Mobile Get Involved Section */}
              <div className="px-3 py-3">
                <div className="text-white font-bold text-lg tracking-wide mb-2">GET INVOLVED</div>
                <div className="ml-4 space-y-2">
                  {getInvolvedItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="block py-1 text-white hover:text-gray-300 font-medium text-base tracking-wide"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              </div>

              {/* Mobile Social Links */}
              <div className="px-3 py-3">
                <div className="text-white font-bold text-lg tracking-wide mb-2">FOLLOW US</div>
                <div className="flex space-x-4">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-gray-300 transition-colors"
                      aria-label={social.name}
                    >
                      <social.icon className="h-6 w-6" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Mobile Cart */}
              <div className="px-3 py-3">
                <a href="/shop" className="flex items-center text-white hover:text-gray-300 font-bold text-lg tracking-wide">
                  <ShoppingCart className="h-6 w-6 mr-2" />
                  CART
                  {cartItems > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItems}
                    </span>
                  )}
                </a>
              </div>
              
              <div className="pt-4 px-3">
                <Button className="w-full bg-white text-black hover:bg-gray-100 font-bold" asChild>
                  <a href="/visit-us">VISIT US</a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
