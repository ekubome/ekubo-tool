export interface ColorResult {
  hex: string
  rgb: { r: number; g: number; b: number }
  hsl: { h: number; s: number; l: number }
  rgbString: string
  hslString: string
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // 支持 3 位和 6 位十六进制颜色代码
  let result = /^#?([a-f\d]{6})$/i.exec(hex)
  if (result) {
    return {
      r: parseInt(result[1].substring(0, 2), 16),
      g: parseInt(result[1].substring(2, 4), 16),
      b: parseInt(result[1].substring(4, 6), 16),
    }
  }
  
  // 处理 3 位简写格式 (如 #fff)
  result = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex)
  if (result) {
    return {
      r: parseInt(result[1] + result[1], 16),
      g: parseInt(result[2] + result[2], 16),
      b: parseInt(result[3] + result[3], 16),
    }
  }
  
  return null
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

export function parseColor(input: string): ColorResult | null {
  input = input.trim()

  // Try HEX
  let rgb = hexToRgb(input)
  if (rgb) {
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
    return {
      hex: input.startsWith('#') ? input : `#${input}`,
      rgb,
      hsl,
      rgbString: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      hslString: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    }
  }

  // Try RGB
  const rgbMatch = input.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i)
  if (rgbMatch) {
    rgb = { r: parseInt(rgbMatch[1]), g: parseInt(rgbMatch[2]), b: parseInt(rgbMatch[3]) }
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
    return {
      hex: rgbToHex(rgb.r, rgb.g, rgb.b),
      rgb,
      hsl,
      rgbString: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      hslString: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    }
  }

  return null
}
