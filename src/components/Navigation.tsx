
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "ABOUT", href: "#" },
    { name: "WATCH", href: "#" },
    { name: "EVENTS", href: "#" },
    { name: "GIVE", href: "#" },
    { name: "ADMIN", href: "/admin" },
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
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button className="bg-white text-black hover:bg-gray-100 font-bold">
              VISIT US
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
              
              <div className="pt-4 px-3">
                <Button className="w-full bg-white text-black hover:bg-gray-100 font-bold">
                  VISIT US
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
