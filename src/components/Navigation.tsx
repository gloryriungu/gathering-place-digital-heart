import { useState, memo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, ShoppingCart } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useSocialMedia } from "@/hooks/useSocialMedia";

export const Navigation = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState(0);
  const [isGetInvolvedOpen, setIsGetInvolvedOpen] = useState(false);
  const { socialLinks } = useSocialMedia();

  const toggleMenu = useCallback(() => setIsOpen(!isOpen), [isOpen]);
  const closeMenu = useCallback(() => setIsOpen(false), []);
  const toggleGetInvolved = useCallback(() => setIsGetInvolvedOpen(!isGetInvolvedOpen), [isGetInvolvedOpen]);

  const navItems = [
    { name: "ABOUT", href: "/about" },
    { name: "WATCH", href: "/watch" },
    { name: "EVENTS", href: "/events" },
    { name: "GIVE", href: "/give" },
    { name: "SHOP", href: "/shop" },
  ];

  const getInvolvedItems = [
    { name: "JOIN THE FAMILY", href: "/join-the-family" },
    { name: "SERVE WITH US", href: "/serve-with-us" },
    { name: "BAPTISM", href: "/baptism" },
    { name: "MINISTRIES", href: "/ministries" },
    { name: "COUNSELING & MENTAL HEALTH", href: "/counseling-mental-health" },
    { name: "PARTNERS", href: "/partners" },
    { name: "BABY DEDICATIONS", href: "/baby-dedication" },
    { name: "PROPHETIC SCHOOL", href: "/prophetic-school" },
    { name: "NEWSLETTER", href: "/newsletter" },
    { name: "NOTICE OF FILMING", href: "/notice-of-filming" },
    { name: "FAQ", href: "/faq" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/">
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">TOT INT</h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-white hover:text-gray-300 font-bold text-sm tracking-wide transition-colors"
              >
                {item.name}
              </Link>
            ))}
            
            
            {/* Get Involved Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-white hover:text-gray-300 font-bold text-sm tracking-wide transition-colors flex items-center gap-1">
                  GET INVOLVED
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border-gray-200 shadow-xl z-50 min-w-[280px] p-2">
                {getInvolvedItems.map((item) => (
                  <DropdownMenuItem key={item.name} asChild>
                    <Link
                      to={item.href}
                      className="text-gray-900 hover:bg-gray-100 font-medium text-sm cursor-pointer block px-3 py-3 rounded-md transition-colors"
                    >
                      {item.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-gray-300 transition-colors"
                  aria-label={social.platform}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>

            {/* Cart Icon */}
            <div className="relative">
              <Link to="/shop" className="text-white hover:text-gray-300 transition-colors">
                <ShoppingCart className="h-5 w-5" />
                {cartItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItems}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" className="text-white border-white hover:bg-white hover:text-black font-bold" asChild>
              <Link to="/auth">SIGN IN</Link>
            </Button>
            <Button className="bg-white text-black hover:bg-gray-100 font-bold" asChild>
              <Link to="/visit-us">VISIT US</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              className="text-white"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden fixed inset-0 top-20 bg-black/98 backdrop-blur-md z-40">
            <div className="h-full overflow-y-auto">
              <div className="px-4 py-6 space-y-2">
                {/* Main Navigation Items */}
                <div className="space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="flex items-center px-4 py-4 text-white hover:bg-white/10 rounded-lg font-semibold text-base tracking-wide transition-colors"
                      onClick={closeMenu}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>

                {/* Divider */}
                <div className="border-t border-white/20 my-4"></div>
                
                {/* Get Involved Section */}
                <Collapsible open={isGetInvolvedOpen} onOpenChange={toggleGetInvolved}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-4 text-white hover:bg-white/10 rounded-lg font-semibold text-base tracking-wide transition-colors">
                    <span>GET INVOLVED</span>
                    <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${isGetInvolvedOpen ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 mt-2">
                    {getInvolvedItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="flex items-center px-8 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg font-medium text-sm transition-colors"
                        onClick={closeMenu}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </CollapsibleContent>
                </Collapsible>

                {/* Divider */}
                <div className="border-t border-white/20 my-4"></div>

                {/* Auth & Actions */}
                <div className="space-y-2">
                  <Link
                    to="/auth"
                    className="flex items-center px-4 py-4 text-white hover:bg-white/10 rounded-lg font-semibold text-base tracking-wide transition-colors"
                    onClick={closeMenu}
                  >
                    SIGN IN
                  </Link>
                  
                  <Link 
                    to="/shop" 
                    className="flex items-center justify-between px-4 py-4 text-white hover:bg-white/10 rounded-lg font-semibold text-base tracking-wide transition-colors" 
                    onClick={closeMenu}
                  >
                    <div className="flex items-center">
                      <ShoppingCart className="h-5 w-5 mr-3" />
                      CART
                    </div>
                    {cartItems > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                        {cartItems}
                      </span>
                    )}
                  </Link>
                </div>

                {/* Divider */}
                <div className="border-t border-white/20 my-6"></div>

                {/* Social Links */}
                <div className="px-4">
                  <div className="text-white font-semibold text-base tracking-wide mb-4">FOLLOW US</div>
                  <div className="flex justify-center space-x-6">
                    {socialLinks.map((social) => (
                      <a
                        key={social.platform}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-gray-300 transition-colors p-2 hover:bg-white/10 rounded-lg"
                        aria-label={social.platform}
                      >
                        <social.icon className="h-6 w-6" />
                      </a>
                    ))}
                  </div>
                </div>
                
                {/* CTA Button */}
                <div className="px-4 pt-6">
                  <Button className="w-full bg-white text-black hover:bg-gray-100 font-bold py-4 text-base rounded-lg" asChild>
                    <Link to="/visit-us" onClick={closeMenu}>VISIT US</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
});

Navigation.displayName = 'Navigation';
