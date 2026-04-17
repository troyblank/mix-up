// Spacing rhythm: full-word tokens. Use `theme.space.medium`, `theme.space.extraSmall`, etc.
// CSS variables use kebab-case: `var(--space-extra-small)`, `var(--space-medium)`, …
export const space = {
  none: '0',
  extraSmall: '0.25rem', // 4px — hairline / outline offset
  small: '0.5rem', // 8px — tight
  medium: '1rem', // 16px — default
  large: '1.5rem', // 24px — section
  extraLarge: '2rem', // 32px — page inset
  maximum: '3rem', // 48px — major block
} as const

export type SpaceScale = typeof space

export type SpaceKey = keyof SpaceScale

// `extraSmall` → `--space-extra-small`, `none` → `--space-none` */
export function spaceVarName(key: SpaceKey): string {
  const kebab = String(key).replace(/([A-Z])/g, '-$1').toLowerCase()

  return `--space-${kebab}`
}

const spaceCssVarLines = (Object.keys(space) as SpaceKey[])
  .map((key) => `    ${spaceVarName(key)}: ${space[key]};`)
  .join('\n')

export const spaceCssVarsBlock = spaceCssVarLines
