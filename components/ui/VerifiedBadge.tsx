/**
 * The verified mark next to a company's name: a filled blue seal with a white
 * check, sized to the text around it (like the badges on X and Facebook).
 * Pass label="" when the word "Verified" is already written next to it.
 */
export function VerifiedBadge({ className = "", label = "Verified company" }: { className?: string; label?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
      className={`inline-block h-[1.15em] w-[1.15em] shrink-0 align-[-0.2em] ${className}`}
    >
      {label && <title>{label}</title>}
      <polygon
        points="12.00,1.00 14.41,3.02 17.50,2.47 18.58,5.42 21.53,6.50 20.98,9.59 23.00,12.00 20.98,14.41 21.53,17.50 18.58,18.58 17.50,21.53 14.41,20.98 12.00,23.00 9.59,20.98 6.50,21.53 5.42,18.58 2.47,17.50 3.02,14.41 1.00,12.00 3.02,9.59 2.47,6.50 5.42,5.42 6.50,2.47 9.59,3.02"
        fill="#1D9BF0"
        stroke="#1D9BF0"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M7.6 12.4l2.9 2.9 5.9-6.1" fill="none" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
