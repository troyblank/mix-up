export const theme = {
  color: {
    bg: '#1d1f27',
    text: '#dedede',
    textMuted: '#a8a8a8',
    accent: '#8ec9d2',
    accentHover: '#7ab8c2',
  },
  font: {
    sizeBase: '16px',
    family: '"Josefin Sans", sans-serif',
  },
  size: {
    medium: '768px',
    small: '600px',
  },
} as const

export type Theme = typeof theme
