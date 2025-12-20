import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export const Logo = ({ className }: LogoProps) => {
  return (
    <div className={cn("relative", className)}>
      <svg
        id="Layer_2"
        data-name="Layer 2"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 236.5 328.95"
        className="w-full h-full"
      >
        <defs>
          <style>
            {`
              .cls-1 {
                fill: #155dfb;
              }
              .cls-1, .cls-2 {
                stroke-width: 0px;
              }
              .cls-2 {
                fill: #fff;
              }
              .cls-3 {
                font-family: HostGrotesk-Bold, sans-serif;
                font-size: 66.87px;
                font-weight: 700;
              }
              .cls-4 {
                letter-spacing: -.02em;
              }
            `}
          </style>
        </defs>
        <g id="Layer_1-2" data-name="Layer 1">
          <g>
            <g>
              <rect
                className="cls-1"
                x="0"
                width="236.5"
                height="236.5"
                rx="36.13"
                ry="36.13"
              />
              <g>
                <polygon
                  className="cls-2"
                  points="168.1 159.28 132.81 159.28 118.05 140.46 111.58 132.23 100.86 118.56 89.64 104.28 68.41 77.23 103.69 77.23 118.5 96.09 124.92 104.28 135.69 117.99 146.87 132.23 168.1 159.28"
                />
                <polygon
                  className="cls-2"
                  points="196.35 40.71 175.12 67.76 167.69 77.23 146.45 104.28 141.72 110.3 136.99 104.28 124.53 88.4 133.3 77.23 140.73 67.76 60.97 67.76 39.74 40.71 196.35 40.71"
                />
                <polygon
                  className="cls-2"
                  points="196.76 195.79 40.23 195.79 61.46 168.74 68.89 159.28 90.13 132.23 94.73 126.36 99.34 132.23 111.92 148.26 103.28 159.28 95.84 168.74 175.53 168.74 196.76 195.79"
                />
              </g>
            </g>
            <text className="cls-3" transform="translate(29.67 306.95)">
              <tspan x="0" y="0">
                Zig
              </tspan>
              <tspan className="cls-4" x="92.95" y="0">
                e
              </tspan>
              <tspan x="129.32" y="0">
                x
              </tspan>
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
};
