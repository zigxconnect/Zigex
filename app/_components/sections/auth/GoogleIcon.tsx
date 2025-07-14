import type { SVGProps } from "react";

// Define the component's props to explicitly include 'size'.
// All other standard SVG props will still be accepted.
type GoogleIconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
};

// Update the function signature to accept 'size' and provide a default.
// The default '24' is just a fallback; our SocialButton will pass '20'.
export const GoogleIcon = ({ size = 24, ...props }: GoogleIconProps) => (
  // Use the 'size' prop to set the width and height of the SVG element.
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fill="#FFC107"
      d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.802 9.122C34.553 5.166 29.695 3 24 3C12.955 3 4 11.955 4 23s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
    />
    <path
      fill="#FF3D00"
      d="M6.306 14.691c2.242-4.337 6.951-7.337 12.187-7.337c3.059 0 5.842 1.154 7.961 3.039L38.802 9.122C34.553 5.166 29.695 3 24 3C16.318 3 9.656 6.915 6.306 14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24 43c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238c-2.008 1.521-4.512 2.43-7.219 2.43c-5.238 0-9.726-3.363-11.303-8H4.949c3.021 7.478 10.552 12.448 19.051 12.448z"
    />
    <path
      fill="#1976D2"
      d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 36.417 44 32.135 44 27c0-1.341-.138-2.65-.389-3.917z"
    />
  </svg>
);
