/**
 * QuickMeet - Open Graph Image Component
 *
 * This component renders the OG image used for social media link previews.
 * It can be used in two ways:
 *
 * 1. Export as a static SVG/PNG for the public/ folder (run the export helper below)
 * 2. Use with @vercel/og for dynamic OG image generation at the edge
 *
 * Recommended OG image dimensions: 1200 x 630
 */

const OGImage = () => {
  return (
    <svg
      width="1200"
      height="630"
      viewBox="0 0 1200 630"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background Gradient */}
      <defs>
        <linearGradient id="bgGradient" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E3A5F" />
          <stop offset="50%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#1E3A5F" />
        </linearGradient>

        <linearGradient id="accentGradient" x1="0" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#22C55E" />
        </linearGradient>

        <linearGradient id="iconGradient" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>

        {/* Glow effect */}
        <radialGradient id="glowCenter" cx="600" cy="260" r="300" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
        </radialGradient>

        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000000" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Background */}
      <rect width="1200" height="630" fill="url(#bgGradient)" />

      {/* Subtle grid pattern */}
      <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#ffffff" strokeOpacity="0.03" strokeWidth="1" />
      </pattern>
      <rect width="1200" height="630" fill="url(#grid)" />

      {/* Center glow */}
      <rect width="1200" height="630" fill="url(#glowCenter)" />

      {/* Decorative circles */}
      <circle cx="100" cy="100" r="200" fill="#2563EB" fillOpacity="0.05" />
      <circle cx="1100" cy="530" r="250" fill="#22C55E" fillOpacity="0.05" />
      <circle cx="900" cy="80" r="120" fill="#3B82F6" fillOpacity="0.04" />

      {/* Video camera icon */}
      <g transform="translate(510, 140)" filter="url(#shadow)">
        {/* Camera body */}
        <rect x="0" y="15" width="110" height="80" rx="14" ry="14" fill="url(#iconGradient)" />
        {/* Camera lens */}
        <polygon points="120,30 160,10 160,100 120,80" fill="url(#iconGradient)" />
        {/* Record dot */}
        <circle cx="30" cy="40" r="6" fill="#EF4444" />
        <circle cx="30" cy="40" r="3" fill="#FCA5A5" />
      </g>

      {/* QuickMeet title */}
      <text
        x="600"
        y="310"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
        fontSize="72"
        fontWeight="800"
        fill="#FFFFFF"
        letterSpacing="-1"
      >
        QuickMeet
      </text>

      {/* Accent line under title */}
      <rect x="420" y="330" width="360" height="4" rx="2" fill="url(#accentGradient)" />

      {/* Tagline */}
      <text
        x="600"
        y="380"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
        fontSize="26"
        fontWeight="400"
        fill="#94A3B8"
        letterSpacing="0.5"
      >
        Quick and Reliable Video Meetings
      </text>

      {/* Feature pills */}
      <g transform="translate(600, 430)">
        {/* HD Video pill */}
        <g transform="translate(-280, 0)">
          <rect x="-60" y="-16" width="120" height="32" rx="16" fill="#2563EB" fillOpacity="0.2" stroke="#2563EB" strokeOpacity="0.4" strokeWidth="1" />
          <text x="0" y="5" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif" fontSize="14" fontWeight="600" fill="#60A5FA">
            HD Video
          </text>
        </g>

        {/* Screen Share pill */}
        <g transform="translate(-100, 0)">
          <rect x="-70" y="-16" width="140" height="32" rx="16" fill="#22C55E" fillOpacity="0.2" stroke="#22C55E" strokeOpacity="0.4" strokeWidth="1" />
          <text x="0" y="5" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif" fontSize="14" fontWeight="600" fill="#4ADE80">
            Screen Share
          </text>
        </g>

        {/* Real-time Chat pill */}
        <g transform="translate(100, 0)">
          <rect x="-75" y="-16" width="150" height="32" rx="16" fill="#A855F7" fillOpacity="0.2" stroke="#A855F7" strokeOpacity="0.4" strokeWidth="1" />
          <text x="0" y="5" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif" fontSize="14" fontWeight="600" fill="#C084FC">
            Real-time Chat
          </text>
        </g>

        {/* Secure pill */}
        <g transform="translate(280, 0)">
          <rect x="-55" y="-16" width="110" height="32" rx="16" fill="#F59E0B" fillOpacity="0.2" stroke="#F59E0B" strokeOpacity="0.4" strokeWidth="1" />
          <text x="0" y="5" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif" fontSize="14" fontWeight="600" fill="#FBBF24">
            Encrypted
          </text>
        </g>
      </g>

      {/* Bottom section */}
      <g transform="translate(600, 520)">
        {/* WebRTC + React + Node badges */}
        <text
          x="0"
          y="0"
          textAnchor="middle"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="16"
          fontWeight="500"
          fill="#64748B"
          letterSpacing="3"
        >
          REACT • WEBRTC • NODE.JS • SOCKET.IO
        </text>
      </g>

      {/* Bottom accent bar */}
      <rect x="0" y="620" width="1200" height="10" fill="url(#accentGradient)" />

      {/* Corner accents */}
      <rect x="0" y="0" width="4" height="60" fill="#2563EB" />
      <rect x="0" y="0" width="60" height="4" fill="#2563EB" />
      <rect x="1196" y="0" width="4" height="60" fill="#22C55E" />
      <rect x="1140" y="0" width="60" height="4" fill="#22C55E" />
    </svg>
  );
};

/**
 * Export as an inline SVG data URL for use in meta tags.
 * Usage: import { ogImageDataUrl } from './opengraph-image';
 */
export const ogImageSVG = `
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1E3A5F"/>
      <stop offset="50%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#1E3A5F"/>
    </linearGradient>
    <linearGradient id="accentGradient" x1="0" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#2563EB"/>
      <stop offset="100%" stop-color="#22C55E"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bgGradient)"/>
  <rect x="0" y="620" width="1200" height="10" fill="url(#accentGradient)"/>
  <text x="600" y="280" text-anchor="middle" font-family="system-ui, sans-serif" font-size="72" font-weight="800" fill="#FFFFFF" letter-spacing="-1">QuickMeet</text>
  <rect x="420" y="300" width="360" height="4" rx="2" fill="url(#accentGradient)"/>
  <text x="600" y="355" text-anchor="middle" font-family="system-ui, sans-serif" font-size="26" font-weight="400" fill="#94A3B8">Quick and Reliable Video Meetings</text>
  <text x="600" y="500" text-anchor="middle" font-family="system-ui, sans-serif" font-size="16" font-weight="500" fill="#64748B" letter-spacing="3">REACT • WEBRTC • NODE.JS • SOCKET.IO</text>
</svg>
`.trim();

export default OGImage;
