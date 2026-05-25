// SVG pattern tiles for wallpaper style previews and canvas tiling.
// Each pattern is designed to repeat seamlessly.

export const WALLPAPER_PATTERNS: Record<string, string> = {
  "Geometric-White": `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
    <rect width="60" height="60" fill="#F5F5F0"/>
    <path d="M0 30 L30 0 L60 30 L30 60 Z" fill="none" stroke="#DDD" stroke-width="1"/>
    <path d="M15 15 L45 15 L45 45 L15 45 Z" fill="none" stroke="#DDD" stroke-width="0.5"/>
  </svg>`,

  "Geometric-Grey": `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
    <rect width="60" height="60" fill="#E0E0E0"/>
    <polygon points="30,5 55,20 55,40 30,55 5,40 5,20" fill="none" stroke="#AAA" stroke-width="1.5"/>
    <polygon points="30,15 45,22 45,38 30,45 15,38 15,22" fill="none" stroke="#BBB" stroke-width="1"/>
  </svg>`,

  "Geometric-Yellow": `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
    <rect width="60" height="60" fill="#FFF8E1"/>
    <path d="M0 0 L30 30 L60 0 M0 60 L30 30 L60 60" fill="none" stroke="#F4C430" stroke-width="2"/>
    <circle cx="30" cy="30" r="8" fill="none" stroke="#F4C430" stroke-width="1.5"/>
  </svg>`,

  "Geometric-Blue": `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
    <rect width="60" height="60" fill="#E3F2FD"/>
    <path d="M0 30 L30 0 L60 30 L30 60 Z" fill="none" stroke="#1565C0" stroke-width="1.5"/>
    <circle cx="30" cy="30" r="8" fill="none" stroke="#42A5F5" stroke-width="1"/>
  </svg>`,

  "Floral-Green": `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
    <rect width="80" height="80" fill="#E8F5E9"/>
    <circle cx="40" cy="40" r="12" fill="#81C784" opacity="0.6"/>
    <ellipse cx="40" cy="24" rx="6" ry="10" fill="#66BB6A" opacity="0.7" transform="rotate(0 40 40)"/>
    <ellipse cx="40" cy="24" rx="6" ry="10" fill="#66BB6A" opacity="0.7" transform="rotate(60 40 40)"/>
    <ellipse cx="40" cy="24" rx="6" ry="10" fill="#66BB6A" opacity="0.7" transform="rotate(120 40 40)"/>
    <ellipse cx="40" cy="24" rx="6" ry="10" fill="#4CAF50" opacity="0.7" transform="rotate(180 40 40)"/>
    <ellipse cx="40" cy="24" rx="6" ry="10" fill="#4CAF50" opacity="0.7" transform="rotate(240 40 40)"/>
    <ellipse cx="40" cy="24" rx="6" ry="10" fill="#4CAF50" opacity="0.7" transform="rotate(300 40 40)"/>
    <circle cx="40" cy="40" r="5" fill="#2E7D32"/>
    <circle cx="10" cy="10" r="3" fill="#A5D6A7" opacity="0.5"/>
    <circle cx="70" cy="70" r="3" fill="#A5D6A7" opacity="0.5"/>
  </svg>`,

  "Floral-Pink": `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
    <rect width="80" height="80" fill="#FCE4EC"/>
    <circle cx="40" cy="40" r="10" fill="#F48FB1" opacity="0.5"/>
    <ellipse cx="40" cy="26" rx="7" ry="11" fill="#F06292" opacity="0.6" transform="rotate(0 40 40)"/>
    <ellipse cx="40" cy="26" rx="7" ry="11" fill="#EC407A" opacity="0.6" transform="rotate(72 40 40)"/>
    <ellipse cx="40" cy="26" rx="7" ry="11" fill="#F06292" opacity="0.6" transform="rotate(144 40 40)"/>
    <ellipse cx="40" cy="26" rx="7" ry="11" fill="#EC407A" opacity="0.6" transform="rotate(216 40 40)"/>
    <ellipse cx="40" cy="26" rx="7" ry="11" fill="#F06292" opacity="0.6" transform="rotate(288 40 40)"/>
    <circle cx="40" cy="40" r="5" fill="#AD1457"/>
    <circle cx="15" cy="65" r="4" fill="#F8BBD0" opacity="0.6"/>
    <circle cx="65" cy="15" r="4" fill="#F8BBD0" opacity="0.6"/>
  </svg>`,

  "Floral-Blue": `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
    <rect width="80" height="80" fill="#E3F2FD"/>
    <circle cx="40" cy="40" r="10" fill="#64B5F6" opacity="0.5"/>
    <ellipse cx="40" cy="26" rx="6" ry="11" fill="#1565C0" opacity="0.7" transform="rotate(0 40 40)"/>
    <ellipse cx="40" cy="26" rx="6" ry="11" fill="#1976D2" opacity="0.6" transform="rotate(60 40 40)"/>
    <ellipse cx="40" cy="26" rx="6" ry="11" fill="#1565C0" opacity="0.7" transform="rotate(120 40 40)"/>
    <ellipse cx="40" cy="26" rx="6" ry="11" fill="#1976D2" opacity="0.6" transform="rotate(180 40 40)"/>
    <ellipse cx="40" cy="26" rx="6" ry="11" fill="#1565C0" opacity="0.7" transform="rotate(240 40 40)"/>
    <ellipse cx="40" cy="26" rx="6" ry="11" fill="#1976D2" opacity="0.6" transform="rotate(300 40 40)"/>
    <circle cx="40" cy="40" r="4" fill="#0D47A1"/>
  </svg>`,

  "Stripe-Blue": `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
    <rect width="40" height="40" fill="#FFFFFF"/>
    <rect x="0" y="0" width="20" height="40" fill="#1565C0" opacity="0.8"/>
  </svg>`,

  "Stripe-Pink": `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
    <rect width="40" height="40" fill="#FFFFFF"/>
    <rect x="0" y="0" width="20" height="40" fill="#F48FB1" opacity="0.7"/>
  </svg>`,

  "Stripe-Grey": `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
    <rect width="40" height="40" fill="#FFFFFF"/>
    <rect x="0" y="0" width="20" height="40" fill="#9E9E9E" opacity="0.6"/>
  </svg>`,

  "Textured-Grey": `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="#E0E0E0"/>
    <path d="M0 25 Q25 20 50 25 Q75 30 100 25" fill="none" stroke="#BDBDBD" stroke-width="0.5"/>
    <path d="M0 50 Q25 45 50 50 Q75 55 100 50" fill="none" stroke="#BDBDBD" stroke-width="0.5"/>
    <path d="M0 75 Q25 70 50 75 Q75 80 100 75" fill="none" stroke="#BDBDBD" stroke-width="0.5"/>
    <circle cx="50" cy="50" r="2" fill="#BDBDBD" opacity="0.5"/>
    <circle cx="0" cy="0" r="2" fill="#BDBDBD" opacity="0.5"/>
    <circle cx="100" cy="100" r="2" fill="#BDBDBD" opacity="0.5"/>
  </svg>`,

  "Textured-White": `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
    <rect width="80" height="80" fill="#F5F5F5"/>
    <rect x="0" y="0" width="40" height="20" fill="#EEEEEE" opacity="0.6"/>
    <rect x="40" y="20" width="40" height="20" fill="#EEEEEE" opacity="0.6"/>
    <rect x="0" y="40" width="40" height="20" fill="#EEEEEE" opacity="0.6"/>
    <rect x="40" y="60" width="40" height="20" fill="#EEEEEE" opacity="0.6"/>
    <line x1="0" y1="20" x2="80" y2="20" stroke="#DDD" stroke-width="1"/>
    <line x1="0" y1="40" x2="80" y2="40" stroke="#DDD" stroke-width="1"/>
    <line x1="0" y1="60" x2="80" y2="60" stroke="#DDD" stroke-width="1"/>
    <line x1="40" y1="0" x2="40" y2="80" stroke="#DDD" stroke-width="0.5"/>
  </svg>`,

  "Textured-Beige": `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
    <rect width="60" height="60" fill="#D7CCC8"/>
    <line x1="0" y1="0" x2="60" y2="60" stroke="#BCAAA4" stroke-width="1" opacity="0.5"/>
    <line x1="0" y1="20" x2="40" y2="60" stroke="#BCAAA4" stroke-width="1" opacity="0.5"/>
    <line x1="20" y1="0" x2="60" y2="40" stroke="#BCAAA4" stroke-width="1" opacity="0.5"/>
    <line x1="60" y1="0" x2="0" y2="60" stroke="#A1887F" stroke-width="0.5" opacity="0.4"/>
  </svg>`,

  "Nature-Green": `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="#E8F5E9"/>
    <path d="M20 80 Q20 40 40 20 Q60 40 60 80" fill="#4CAF50" opacity="0.6"/>
    <path d="M60 90 Q60 55 75 35 Q90 55 90 90" fill="#388E3C" opacity="0.5"/>
    <path d="M0 95 Q5 60 20 45 Q35 60 30 95" fill="#66BB6A" opacity="0.4"/>
    <path d="M40 20 Q45 10 50 5 Q55 10 60 20" fill="#2E7D32" opacity="0.7"/>
  </svg>`,

  "Feature-Blue": `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
    <rect width="120" height="120" fill="#E3F2FD"/>
    <circle cx="60" cy="60" r="40" fill="none" stroke="#1565C0" stroke-width="2" opacity="0.3"/>
    <circle cx="60" cy="60" r="25" fill="none" stroke="#1976D2" stroke-width="1.5" opacity="0.4"/>
    <circle cx="60" cy="60" r="10" fill="#1E88E5" opacity="0.5"/>
    <path d="M20 20 Q60 10 100 20 Q110 60 100 100 Q60 110 20 100 Q10 60 20 20" fill="none" stroke="#42A5F5" stroke-width="1" opacity="0.3"/>
  </svg>`,

  "Abstract-Orange": `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="#FFF3E0"/>
    <path d="M0 50 Q25 20 50 50 Q75 80 100 50" fill="none" stroke="#FF6F00" stroke-width="3" opacity="0.6"/>
    <path d="M0 70 Q25 40 50 70 Q75 100 100 70" fill="none" stroke="#F57C00" stroke-width="2" opacity="0.5"/>
    <path d="M0 30 Q25 0 50 30 Q75 60 100 30" fill="none" stroke="#E65100" stroke-width="2" opacity="0.4"/>
    <circle cx="50" cy="50" r="15" fill="#FF8F00" opacity="0.2"/>
  </svg>`,

  "Plain-Grey": `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
    <defs>
      <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#CFD8DC"/>
        <stop offset="50%" style="stop-color:#90A4AE"/>
        <stop offset="100%" style="stop-color:#CFD8DC"/>
      </linearGradient>
    </defs>
    <rect width="40" height="40" fill="#B0BEC5"/>
    <rect width="40" height="40" fill="url(#shimmer)" opacity="0.3"/>
  </svg>`,
};

/** Get pattern SVG for a wallpaper by style + colourFamily, with fallbacks. */
export function getWallpaperPattern(style: string, colourFamily: string): string {
  const key = `${style}-${colourFamily}`;
  return (
    WALLPAPER_PATTERNS[key] ||
    WALLPAPER_PATTERNS[`${style}-Grey`] ||
    WALLPAPER_PATTERNS["Textured-Grey"]
  );
}

/** Encode an SVG string as a CSS/canvas-compatible data URL. */
export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
