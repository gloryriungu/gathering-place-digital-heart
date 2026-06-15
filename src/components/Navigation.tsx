/**
 * Navigation Component
 * 
 * Language: TypeScript + React
 * 
 * Purpose:
 * - Fixed top navigation bar for the entire website
 * - Provides primary site navigation and mobile menu
 * - Includes social media links and shopping cart
 * - Features dropdown menu for "Get Involved" section
 * 
 * Key Features:
 * - Responsive mobile hamburger menu
 * - Dropdown menu with multiple sub-items
 * - Dynamic social media links from Supabase
 * - Shopping cart with item count badge
 * - Sign in and Visit Us CTA buttons
 * - Semi-transparent background with backdrop blur
 */

import { useState, memo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, ShoppingCart, Heart } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useSocialMedia } from "@/hooks/useSocialMedia";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import logo from "@/assets/logo.png";
import { PortalSwitcher } from "@/components/shared/PortalSwitcher";

export const Navigation = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isGetInvolvedOpen, setIsGetInvolvedOpen] = useState(false);
  const { socialLinks } = useSocialMedia();

  useEffect(() => {
    fetchWishlistCount();
    
    // Subscribe to wishlist changes
    const channel = supabase
      .channel('wishlist-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wishlist',
        },
        () => {
          fetchWishlistCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchWishlistCount = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setWishlistCount(0);
      return;
    }

    const { count } = await supabase
      .from('wishlist')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    setWishlistCount(count || 0);
  };

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
        <div className="flex justify-between items-center h-20 gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img src={logo} alt="TOT International" className="h-11 w-11 lg:h-12 lg:w-12 object-contain" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-white/90 hover:text-white font-semibold text-[13px] tracking-[0.08em] transition-colors"
              >
                {item.name}
              </Link>
            ))}

            {/* Get Involved Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-white/90 hover:text-white font-semibold text-[13px] tracking-[0.08em] transition-colors flex items-center gap-1">
                  GET INVOLVED
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg z-50">
                {getInvolvedItems.map((item) => (
                  <DropdownMenuItem key={item.name} asChild>
                    <Link
                      to={item.href}
                      className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold text-sm tracking-wide cursor-pointer block px-4 py-2"
                    >
                      {item.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right cluster: icons + CTAs */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Social Links — only on wide screens to keep the bar uncluttered */}
            <div className="hidden 2xl:flex items-center gap-3 pr-3 border-r border-white/15">
              {socialLinks.map((social) => (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors"
                  aria-label={social.platform}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            {/* Wishlist & Cart Icons */}
            <div className="flex items-center gap-3">
              <Link to="/wishlist" className="relative text-white/80 hover:text-white transition-colors" aria-label="Wishlist">
                <Heart className="h-[18px] w-[18px]" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link to="/shop" className="relative text-white/80 hover:text-white transition-colors" aria-label="Cart">
                <ShoppingCart className="h-[18px] w-[18px]" />
                {cartItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                    {cartItems}
                  </span>
                )}
              </Link>
            </div>

            {/* Divider */}
            <span className="h-6 w-px bg-white/15" aria-hidden="true" />

            {/* CTAs */}
            <PortalSwitcher variant="outline" className="bg-transparent text-white hover:bg-white hover:text-black font-semibold border-white/30 h-9 px-3" />
            <Button variant="ghost" className="text-white hover:bg-white/10 font-semibold h-9 px-3" asChild>
              <Link to="/auth">SIGN IN</Link>
            </Button>
            <Button className="bg-white text-black hover:bg-gray-100 font-semibold h-9 px-4" asChild>
              <Link to="/visit-us">VISIT US</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu} className="text-white">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-md max-h-[calc(100vh-5rem)] overflow-y-auto">
            <div className="px-2 pt-2 pb-6 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-3 py-3 text-white hover:text-gray-300 font-bold text-lg tracking-wide"
                  onClick={closeMenu}
                >
                  {item.name}
                </Link>
              ))}

              <Link
                to="/auth"
                className="block px-3 py-3 text-white hover:text-gray-300 font-bold text-lg tracking-wide"
                onClick={closeMenu}
              >
                SIGN IN
              </Link>

              {/* Mobile Get Involved Collapsible Section */}
              <Collapsible open={isGetInvolvedOpen} onOpenChange={toggleGetInvolved}>
                <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-3 text-white hover:text-gray-300 font-bold text-lg tracking-wide">
                  GET INVOLVED
                  <ChevronDown className={`h-5 w-5 transition-transform ${isGetInvolvedOpen ? "rotate-180" : ""}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="ml-4 space-y-2">
                  {getInvolvedItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="block py-2 px-3 text-white hover:text-gray-300 font-medium text-base tracking-wide"
                      onClick={closeMenu}
                    >
                      {item.name}
                    </Link>
                  ))}
                </CollapsibleContent>
              </Collapsible>

              {/* Mobile Social Links */}
              <div className="px-3 py-3">
                <div className="text-white font-bold text-lg tracking-wide mb-2">FOLLOW US</div>
                <div className="flex space-x-4">
                  {socialLinks.map((social) => (
                    <a
                      key={social.platform}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-gray-300 transition-colors"
                      aria-label={social.platform}
                    >
                      <social.icon className="h-6 w-6" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Mobile Cart */}
              <div className="px-3 py-3">
                <Link
                  to="/shop"
                  className="flex items-center text-white hover:text-gray-300 font-bold text-lg tracking-wide"
                  onClick={closeMenu}
                >
                  <ShoppingCart className="h-6 w-6 mr-2" />
                  CART
                  {cartItems > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItems}
                    </span>
                  )}
                </Link>
              </div>

              <div className="pt-4 px-3 space-y-3">
                <div className="flex justify-center">
                  <PortalSwitcher variant="outline" className="w-full bg-white text-black hover:bg-gray-100 font-semibold border-white" />
                </div>
                <Button className="w-full bg-white text-black hover:bg-gray-100 font-bold" asChild>
                  <Link to="/visit-us" onClick={closeMenu}>
                    VISIT US
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
});

Navigation.displayName = "Navigation";
