import { MessageCircle } from "lucide-react";
import { memo } from "react";

const WhatsAppButton = memo(() => {
  return (
    <a
      href="https://wa.me/254701443446?text=Hello!%20I%20need%20assistance%20from%20TOT%20International"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contact us on WhatsApp"
      className="fixed left-4 md:left-6 bottom-20 md:bottom-6 w-14 h-14 md:w-16 md:h-16 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 z-50 group animate-slide-in-left"
    >
      <MessageCircle className="w-6 h-6 md:w-8 md:h-8" />
      <span className="sr-only">Contact us on WhatsApp: 0701443446</span>
    </a>
  );
});

WhatsAppButton.displayName = "WhatsAppButton";

export default WhatsAppButton;
