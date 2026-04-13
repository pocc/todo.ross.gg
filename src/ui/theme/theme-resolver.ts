import type { ThemeDefinition, ThemeColors } from "~/ui/theme/themes"
import type { ThemeMode } from "~/lib/types"

/**
 * Hex color to HSL components.
 */
function hexToHsl(hex: string): [number, number, number] {
  const cleaned = hex.replace("#", "")
  const r = parseInt(cleaned.substring(0, 2), 16) / 255
  const g = parseInt(cleaned.substring(2, 4), 16) / 255
  const b = parseInt(cleaned.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2

  if (max === min) {
    return [0, 0, l * 100]
  }

  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

  let h = 0
  if (max === r) {
    h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  } else if (max === g) {
    h = ((b - r) / d + 2) / 6
  } else {
    h = ((r - g) / d + 4) / 6
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

/**
 * Adjust lightness of an HSL color.
 */
function adjustLightness(hex: string, amount: number): string {
  const [h, s, l] = hexToHsl(hex)
  const newL = Math.max(0, Math.min(100, l + amount))
  return `hsl(${h}, ${s}%, ${newL}%)`
}

/**
 * Convert a hex color to an HSL CSS string.
 */
function toHsl(hex: string): string {
  // Handle hex colors with alpha channel suffix (like "#acb6bf8c")
  const cleaned = hex.replace("#", "").substring(0, 6)
  const [h, s, l] = hexToHsl(`#${cleaned}`)
  return `hsl(${h}, ${s}%, ${l}%)`
}

/**
 * Build a set of generated scale variables from a single seed color.
 * Returns 5 steps: lightest, light, base, dark, darkest.
 */
function generateScale(hex: string): Record<string, string> {
  return {
    lightest: adjustLightness(hex, 30),
    light: adjustLightness(hex, 15),
    base: toHsl(hex),
    dark: adjustLightness(hex, -15),
    darkest: adjustLightness(hex, -30),
  }
}

const CSS_VAR_MAP: Record<keyof ThemeColors, string> = {
  bg: "--oc-bg-primary",
  bgSecondary: "--oc-bg-secondary",
  bgTertiary: "--oc-bg-tertiary",
  surface: "--oc-surface-primary",
  surfaceSecondary: "--oc-surface-secondary",
  text: "--oc-text-primary",
  textSecondary: "--oc-text-secondary",
  textTertiary: "--oc-text-tertiary",
  border: "--oc-border-primary",
  borderSecondary: "--oc-border-secondary",
  accent: "--oc-accent-primary",
  accentHover: "--oc-accent-hover",
  accentText: "--oc-accent-text",
  success: "--oc-success",
  warning: "--oc-warning",
  error: "--oc-error",
  info: "--oc-info",
  diffAddBg: "--oc-diff-add-bg",
  diffAddText: "--oc-diff-add-text",
  diffDelBg: "--oc-diff-del-bg",
  diffDelText: "--oc-diff-del-text",
  syntaxKeyword: "--oc-syntax-keyword",
  syntaxString: "--oc-syntax-string",
  syntaxNumber: "--oc-syntax-number",
  syntaxFunction: "--oc-syntax-function",
  syntaxComment: "--oc-syntax-comment",
  syntaxVariable: "--oc-syntax-variable",
}

/**
 * Resolve a theme + mode into a CSS string of custom properties
 * to be injected into a <style> tag.
 */
export function resolveThemeCSS(theme: ThemeDefinition, mode: "light" | "dark"): string {
  const colors = mode === "light" ? theme.light : theme.dark

  const lines: string[] = [":root {"]

  for (const [key, varName] of Object.entries(CSS_VAR_MAP)) {
    const hex = colors[key as keyof ThemeColors]
    if (hex) {
      lines.push(`  ${varName}: ${toHsl(hex)};`)
    }
  }

  // Derived vars that components expect
  lines.push(`  --oc-bg-elevated: ${adjustLightness(colors.bg, mode === "dark" ? 8 : -3)};`)
  lines.push(`  --oc-bg-hover: ${adjustLightness(colors.bgSecondary, mode === "dark" ? 6 : -4)};`)
  lines.push(`  --oc-bg-active: ${adjustLightness(colors.bgSecondary, mode === "dark" ? 10 : -8)};`)
  lines.push(`  --oc-surface-tertiary: ${adjustLightness(colors.surfaceSecondary, mode === "dark" ? 5 : -4)};`)
  lines.push(`  --oc-text-disabled: ${adjustLightness(colors.textTertiary, mode === "dark" ? -10 : 15)};`)
  lines.push(`  --oc-border-focus: ${toHsl(colors.accent)};`)

  // Generate accent scale from accent seed
  const accentScale = generateScale(colors.accent)
  lines.push(`  --oc-accent-lightest: ${accentScale.lightest};`)
  lines.push(`  --oc-accent-light: ${accentScale.light};`)
  lines.push(`  --oc-accent-dark: ${accentScale.dark};`)
  lines.push(`  --oc-accent-darkest: ${accentScale.darkest};`)

  // Generate success scale
  const successScale = generateScale(colors.success)
  lines.push(`  --oc-success-light: ${successScale.light};`)
  lines.push(`  --oc-success-dark: ${successScale.dark};`)

  // Generate error scale
  const errorScale = generateScale(colors.error)
  lines.push(`  --oc-error-light: ${errorScale.light};`)
  lines.push(`  --oc-error-dark: ${errorScale.dark};`)

  // Expose raw hex values for contexts that need them (e.g. canvas)
  lines.push(`  --oc-bg-raw: ${colors.bg};`)
  lines.push(`  --oc-text-raw: ${colors.text};`)
  lines.push(`  --oc-accent-raw: ${colors.accent};`)

  lines.push("}")

  return lines.join("\n")
}

/**
 * Resolve which effective mode to use given a mode preference.
 */
export function resolveMode(mode: ThemeMode): "light" | "dark" {
  if (mode === "light" || mode === "dark") return mode
  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  }
  return "dark"
}
