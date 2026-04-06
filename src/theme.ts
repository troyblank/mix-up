export const theme = {
  color: {
    bg: '#1d1f27',
    text: '#dedede',
    textMuted: '#a8a8a8',
    accent: '#8ec9d2',
    accentHover: '#7ab8c2',
    surface: '#2a2d36',
    danger: '#a84848',
    shadow: 'rgba(0, 0, 0, 0.35)',
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
