
import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'ZIGEX - Blog'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #2563EB, #1E40AF)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        <div style={{ fontSize: 80, fontWeight: 'bold', marginBottom: 20 }}>
          ZIGEX
        </div>
        <div style={{ fontSize: 48, textAlign: 'center', maxWidth: '80%' }}>
          Latest News & Tech Insights
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
