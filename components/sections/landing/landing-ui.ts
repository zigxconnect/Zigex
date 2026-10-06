/**
 * Shared landing-page styles, so buttons, containers and section headings are
 * the same size and alignment everywhere on the page.
 *
 * Button standard:
 * - Heights: 44px (md, the minimum comfortable touch target on iOS/Android)
 *   and 48px (lg, for the hero's main actions).
 * - Horizontal padding 20–24px, 12px radius, 15–16px semibold label,
 *   8px gap to an icon.
 * - States: hover darkens, press scales to 98%, keyboard focus shows a ring.
 */

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap " +
  "transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out " +
  "active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] " +
  "focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

const sizes = {
  md: "h-11 px-5 text-[15px]",
  lg: "h-12 px-6 text-base",
};

const variants = {
  // Solid brand blue: the one main action in a view.
  primary: "bg-[#155DFC] text-white shadow-sm shadow-[#155DFC]/25 hover:bg-[#0F3FB8]",
  // Quiet outline for the alternative action next to a primary.
  secondary: "bg-white text-[#0B1B3F] border border-[#DCE5F5] hover:border-[#155DFC]/40 hover:bg-[#F3F7FF]",
  // Text-only, for low-emphasis actions such as "Sign in" in the header.
  ghost: "text-[#0B1B3F] hover:bg-[#F3F7FF]",
};

export function landingButton(variant: keyof typeof variants = "primary", size: keyof typeof sizes = "md") {
  return `${base} ${sizes[size]} ${variants[variant]}`;
}

/** One container width and side padding for every section. */
export const landingContainer = "mx-auto w-full max-w-6xl px-5 sm:px-8";

/** Section heading block: left-aligned, readable line length. */
export const landingSectionTitle = "font-heading text-3xl sm:text-4xl font-bold tracking-tight text-[#0B1B3F]";
export const landingSectionLead = "mt-4 max-w-2xl text-lg leading-relaxed text-[#4A5670]";
