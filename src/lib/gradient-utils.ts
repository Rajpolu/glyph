export type GradientType = 'linear' | 'radial' | 'conic';

export interface GradientStop {
  id: string;
  color: string; // 6-digit hex string e.g. #ff0055
  position: number; // 0 to 100
  opacity: number; // 0 to 100
}

export interface GradientConfig {
  type: GradientType;
  angle: number; // 0 to 360
  stops: GradientStop[];
}

// Convert 3 or 6 digit hex to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleanHex = hex.replace(/^#/, '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num) || cleanHex.length < 6) {
    return { r: 99, g: 102, b: 241 }; // Default indigo
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (h >= 0 && h < 60) {
    r1 = c; g1 = x; b1 = 0;
  } else if (h >= 60 && h < 120) {
    r1 = x; g1 = c; b1 = 0;
  } else if (h >= 120 && h < 180) {
    r1 = 0; g1 = c; b1 = x;
  } else if (h >= 180 && h < 240) {
    r1 = 0; g1 = x; b1 = c;
  } else if (h >= 240 && h < 300) {
    r1 = x; g1 = 0; b1 = c;
  } else {
    r1 = c; g1 = 0; b1 = x;
  }

  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

export function hslToHex(h: number, s: number, l: number): string {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsl(r, g, b);
}

export function stopToCssColor(stop: GradientStop): string {
  if (stop.opacity === 100 || stop.opacity === undefined) {
    return stop.color;
  }
  const { r, g, b } = hexToRgb(stop.color);
  const alpha = (stop.opacity / 100).toFixed(2).replace(/\.?0+$/, '');
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function generateGradientCss(config: GradientConfig): string {
  const sortedStops = [...config.stops].sort((a, b) => a.position - b.position);
  const stopString = sortedStops
    .map((s) => `${stopToCssColor(s)} ${Math.round(s.position)}%`)
    .join(', ');

  switch (config.type) {
    case 'radial':
      return `radial-gradient(circle at 50% 50%, ${stopString})`;
    case 'conic':
      return `conic-gradient(from ${Math.round(config.angle)}deg at 50% 50%, ${stopString})`;
    case 'linear':
    default:
      return `linear-gradient(${Math.round(config.angle)}deg, ${stopString})`;
  }
}

// Fallback default config
export const DEFAULT_GRADIENT_CONFIG: GradientConfig = {
  type: 'linear',
  angle: 135,
  stops: [
    { id: 'stop-1', color: '#ec4899', position: 0, opacity: 100 },
    { id: 'stop-2', color: '#8b5cf6', position: 50, opacity: 100 },
    { id: 'stop-3', color: '#6366f1', position: 100, opacity: 100 },
  ],
};

// Robust parser for css gradient strings
export function parseGradientCss(css: string | undefined): GradientConfig {
  if (!css || typeof css !== 'string') {
    return { ...DEFAULT_GRADIENT_CONFIG };
  }

  const str = css.trim();
  let type: GradientType = 'linear';
  let angle = 135;

  if (str.startsWith('radial-gradient')) {
    type = 'radial';
  } else if (str.startsWith('conic-gradient')) {
    type = 'conic';
    const matchAngle = str.match(/from\s+([0-9.]+)deg/i);
    if (matchAngle) {
      angle = parseFloat(matchAngle[1]);
    }
  } else if (str.startsWith('linear-gradient')) {
    type = 'linear';
    const matchAngle = str.match(/linear-gradient\(\s*([0-9.]+)deg/i);
    if (matchAngle) {
      angle = parseFloat(matchAngle[1]);
    }
  } else {
    // If it's a solid color
    if (str.startsWith('#') || str.startsWith('rgb')) {
      return {
        type: 'linear',
        angle: 135,
        stops: [
          { id: 'stop-1', color: str.startsWith('#') ? str : '#6366f1', position: 0, opacity: 100 },
          { id: 'stop-2', color: str.startsWith('#') ? str : '#6366f1', position: 100, opacity: 100 },
        ],
      };
    }
    return { ...DEFAULT_GRADIENT_CONFIG };
  }

  // Parse color stops
  const stops: GradientStop[] = [];
  // Match color stop patterns: either #hex or rgb/rgba followed by optional position %
  const stopRegex = /(#(?:[0-9a-fA-F]{3,8})|rgba?\([^)]+\))\s*([0-9.]+)?%?/gi;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = stopRegex.exec(str)) !== null) {
    const rawColor = match[1];
    const rawPos = match[2];
    let hex = '#6366f1';
    let opacity = 100;

    if (rawColor.startsWith('#')) {
      hex = rawColor.slice(0, 7);
      if (rawColor.length === 9) {
        opacity = Math.round((parseInt(rawColor.slice(7, 9), 16) / 255) * 100);
      }
    } else if (rawColor.startsWith('rgb')) {
      const nums = rawColor.match(/([0-9.]+)/g);
      if (nums && nums.length >= 3) {
        hex = rgbToHex(parseFloat(nums[0]), parseFloat(nums[1]), parseFloat(nums[2]));
        if (nums.length >= 4) {
          opacity = Math.round(parseFloat(nums[3]) * 100);
        }
      }
    }

    stops.push({
      id: `stop-${index + 1}-${Date.now()}`,
      color: hex,
      position: rawPos !== undefined ? parseFloat(rawPos) : index === 0 ? 0 : 100,
      opacity,
    });
    index++;
  }

  if (stops.length < 2) {
    return { ...DEFAULT_GRADIENT_CONFIG, type, angle };
  }

  return {
    type,
    angle,
    stops,
  };
}

// Curated designer palettes
export const CURATED_PALETTES = [
  { name: 'Sunset Glow', colors: ['#f43f5e', '#fb923c', '#facc15'] },
  { name: 'Cyber Neon', colors: ['#06b6d4', '#8b5cf6', '#ec4899'] },
  { name: 'Aurora Borealis', colors: ['#10b981', '#06b6d4', '#6366f1'] },
  { name: 'Deep Nebula', colors: ['#3b82f6', '#8b5cf6', '#d946ef'] },
  { name: 'Peach Velvet', colors: ['#ff758c', '#ff7eb3', '#f7d794'] },
  { name: 'Midnight Void', colors: ['#0f172a', '#1e1b4b', '#312e81'] },
  { name: 'Emerald Forest', colors: ['#059669', '#10b981', '#34d399'] },
  { name: 'Golden Hour', colors: ['#ea580c', '#f59e0b', '#fbbf24'] },
  { name: 'Cotton Candy', colors: ['#f472b6', '#c084fc', '#60a5fa'] },
  { name: 'Obsidian Fire', colors: ['#18181b', '#b91c1c', '#f97316'] },
];

export const VIBRANT_COLOR_SWATCHES = [
  '#f43f5e', '#ec4899', '#d946ef', '#a855f7',
  '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9',
  '#06b6d4', '#14b8a6', '#10b981', '#22c55e',
  '#84cc16', '#eab308', '#f59e0b', '#f97316',
  '#ef4444', '#78716c', '#0f172a', '#ffffff',
];

// Generate an aesthetically pleasing harmonic gradient
export function generateRandomHarmonicGradient(): GradientConfig {
  const baseHue = Math.floor(Math.random() * 360);
  const hueShift = 45 + Math.floor(Math.random() * 40);
  const hue2 = (baseHue + hueShift) % 360;
  const hue3 = (baseHue + hueShift * 2) % 360;

  const types: GradientType[] = ['linear', 'linear', 'radial', 'conic'];
  const type = types[Math.floor(Math.random() * types.length)];
  const angle = Math.floor(Math.random() * 8) * 45;

  return {
    type,
    angle,
    stops: [
      { id: `stop-1-${Date.now()}`, color: hslToHex(baseHue, 85, 55), position: 0, opacity: 100 },
      { id: `stop-2-${Date.now()}`, color: hslToHex(hue2, 80, 52), position: 52, opacity: 100 },
      { id: `stop-3-${Date.now()}`, color: hslToHex(hue3, 85, 50), position: 100, opacity: 100 },
    ],
  };
}
