/**
 * BrandLoader — the TOT "Supernatural Shimmer" loading state.
 *
 * Two variants:
 *  - BrandLoader: full-screen plum backdrop used for page transitions and guards.
 *  - SectionLoader: compact branded mini-loader used inside content sections
 *    (events, sermons, shop, dashboards) instead of grey skeletons.
 *
 * All animation keyframes live in src/index.css (.brand-* classes).
 */
import { memo } from "react";
import logoUrl from "@/assets/logo.png";

interface BrandLoaderProps {
  /** Short text shown under the emblem (e.g. "Verifying Payment"). */
  label?: string;
}

const TITLE = "TENT OF TESTIMONIES";
const TAGLINE = "Home of Supernatural Solutions";

const Emblem = ({ size }: { size: number }) => (
  <img
    src={logoUrl}
    alt=""
    aria-hidden
    style={{ width: size, height: size }}
    className="relative z-10 rounded-full object-cover"
  />
);

const Shimmer = () => (
  <span
    aria-hidden
    className="brand-shimmer pointer-events-none absolute inset-0 overflow-hidden rounded-full"
  />
);

export const BrandLoader = memo(({ label }: BrandLoaderProps) => (
  <div
    role="status"
    aria-label={label || "Loading"}
    className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-plum-deep px-6"
  >
    {/* Ethereal amber spotlight */}
    <span aria-hidden className="brand-glow pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,hsl(var(--amber)/0.22)_0%,transparent_62%)]" />

    {/* Emblem with concentric pulse waves and shimmer sweep */}
    <div className="relative flex h-32 w-32 items-center justify-center">
      <span aria-hidden className="brand-ring absolute inset-2" />
      <span aria-hidden className="brand-ring absolute inset-2 [animation-delay:0.7s]" />
      <span aria-hidden className="brand-ring absolute inset-2 [animation-delay:1.4s]" />
      <span aria-hidden className="brand-halo absolute inset-3 rounded-full" />
      <Emblem size={88} />
      <Shimmer />
    </div>

    {/* Letter-by-letter fade of the church name */}
    <p className="mt-9 flex flex-wrap justify-center font-display text-lg font-bold uppercase leading-relaxed tracking-[0.45em] text-cream md:text-xl">
      {TITLE.split("").map((char, i) => (
        <span
          key={i}
          className="brand-letter"
          style={{ animationDelay: `${0.15 + i * 0.045}s` }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </p>
    <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-amber md:text-xs">
      {TAGLINE}
    </p>

    {/* Ultra-thin gold progress hairline */}
    <div className="mt-9 h-px w-52 overflow-hidden rounded-full bg-cream/10">
      <span aria-hidden className="brand-beam block h-full w-1/3 bg-gradient-to-r from-transparent via-amber to-transparent" />
    </div>
  </div>
));

BrandLoader.displayName = "BrandLoader";

export const SectionLoader = memo(({ label = "Loading" }: BrandLoaderProps) => (
  <div
    role="status"
    aria-label={label}
    className="flex flex-col items-center justify-center gap-4 py-14"
  >
    <div className="relative flex h-16 w-16 items-center justify-center">
      <span aria-hidden className="brand-ring absolute inset-0" />
      <span aria-hidden className="brand-ring absolute inset-0 [animation-delay:0.9s]" />
      <span aria-hidden className="brand-halo absolute inset-1.5 rounded-full" />
      <Emblem size={40} />
      <Shimmer />
    </div>
    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
      {label}
    </p>
    <div className="h-px w-28 overflow-hidden rounded-full bg-border">
      <span aria-hidden className="brand-beam block h-full w-1/3 bg-gradient-to-r from-transparent via-amber to-transparent" />
    </div>
  </div>
));

SectionLoader.displayName = "SectionLoader";

export default BrandLoader;
