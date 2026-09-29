import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Site-wide gentle fade/slide-up reveal for page sections and cards.
 * Skips the fixed nav, dialogs and portal dashboards' sidebars.
 */
const SELECTOR = "main section, body > #root section, .card-lift";

export const ScrollReveal = () => {
  const location = useLocation();

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    const tag = () => {
      document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
        if (el.dataset.revealed || el.closest("[role=dialog], nav, header")) return;
        el.dataset.revealed = "1";
        // Stagger sibling cards for a cascading entrance
        const idx = el.parentElement ? Array.from(el.parentElement.children).indexOf(el) : 0;
        if (el.classList.contains("card-lift")) el.style.setProperty("--reveal-delay", `${Math.min(idx, 5) * 90}ms`);
        el.classList.add("reveal");
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight) requestAnimationFrame(() => el.classList.add("is-visible"));
        else io.observe(el);
      });
    };

    tag();
    const mo = new MutationObserver(tag);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, [location.pathname]);

  return null;
};
