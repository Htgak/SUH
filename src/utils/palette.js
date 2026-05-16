function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function toHex(value) {
  return Math.round(value).toString(16).padStart(2, '0');
}

export function hslToHex(hue, saturation, lightness) {
  const h = ((hue % 360) + 360) % 360;
  const s = clamp(saturation / 100);
  const l = clamp(lightness / 100);

  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const x = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
  const match = l - chroma / 2;

  let red;
  let green;
  let blue;

  if (h < 60) [red, green, blue] = [chroma, x, 0];
  else if (h < 120) [red, green, blue] = [x, chroma, 0];
  else if (h < 180) [red, green, blue] = [0, chroma, x];
  else if (h < 240) [red, green, blue] = [0, x, chroma];
  else if (h < 300) [red, green, blue] = [x, 0, chroma];
  else [red, green, blue] = [chroma, 0, x];

  return `#${toHex((red + match) * 255)}${toHex((green + match) * 255)}${toHex((blue + match) * 255)}`;
}

export function hexToHsl(hex) {
  const normalized = hex.replace('#', '');
  const expanded =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => `${char}${char}`)
          .join('')
      : normalized;

  const red = Number.parseInt(expanded.slice(0, 2), 16) / 255;
  const green = Number.parseInt(expanded.slice(2, 4), 16) / 255;
  const blue = Number.parseInt(expanded.slice(4, 6), 16) / 255;

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  let hue = 0;
  if (delta !== 0) {
    if (max === red) hue = ((green - blue) / delta) % 6;
    else if (max === green) hue = (blue - red) / delta + 2;
    else hue = (red - green) / delta + 4;
  }

  hue = Math.round(hue * 60);
  if (hue < 0) hue += 360;

  const lightness = (max + min) / 2;
  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));

  return {
    h: hue,
    s: Math.round(saturation * 100),
    l: Math.round(lightness * 100)
  };
}

function createFromHues(hues, saturation = 72, lightness = 52) {
  return hues.map((hue) => hslToHex(hue, saturation, lightness));
}

export function generatePalette(baseHex, mode = 'analogous') {
  const base = hexToHsl(baseHex);

  if (mode === 'random') {
    return Array.from({ length: 5 }, (_, index) => hslToHex((base.h + index * 57) % 360, 68, 50));
  }

  if (mode === 'complementary') {
    return createFromHues([
      base.h,
      (base.h + 20) % 360,
      (base.h + 180) % 360,
      (base.h + 200) % 360,
      (base.h + 340) % 360
    ]);
  }

  if (mode === 'triadic') {
    return createFromHues([
      base.h,
      (base.h + 120) % 360,
      (base.h + 240) % 360,
      (base.h + 40) % 360,
      (base.h + 280) % 360
    ]);
  }

  return createFromHues([
    (base.h + 330) % 360,
    (base.h + 350) % 360,
    base.h,
    (base.h + 20) % 360,
    (base.h + 40) % 360
  ]);
}
