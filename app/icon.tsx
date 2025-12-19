import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 236.5 236.5"
          width="100%"
          height="100%"
        >
          {/* Background Rect - Blue #155dfb */}
          <rect
            x="0"
            y="0"
            width="236.5"
            height="236.5"
            rx="36.13"
            ry="36.13"
            fill="#155dfb"
          />
          
          {/* Logo Polygons - White #fff */}
          <polygon
            fill="#fff"
            points="168.1 159.28 132.81 159.28 118.05 140.46 111.58 132.23 100.86 118.56 89.64 104.28 68.41 77.23 103.69 77.23 118.5 96.09 124.92 104.28 135.69 117.99 146.87 132.23 168.1 159.28"
          />
          <polygon
            fill="#fff"
            points="196.35 40.71 175.12 67.76 167.69 77.23 146.45 104.28 141.72 110.3 136.99 104.28 124.53 88.4 133.3 77.23 140.73 67.76 60.97 67.76 39.74 40.71 196.35 40.71"
          />
          <polygon
            fill="#fff"
            points="196.76 195.79 40.23 195.79 61.46 168.74 68.89 159.28 90.13 132.23 94.73 126.36 99.34 132.23 111.92 148.26 103.28 159.28 95.84 168.74 175.53 168.74 196.76 195.79"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
