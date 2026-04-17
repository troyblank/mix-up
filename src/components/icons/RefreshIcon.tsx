import type { FunctionComponent, SVGProps } from 'react'

import { SVG_NAMESPACE } from './utils'

export const RefreshIcon: FunctionComponent<SVGProps<SVGSVGElement>> = (
  props,
) => (
  <svg
    xmlns={SVG_NAMESPACE}
    viewBox={'0 0 24 24'}
    width={'1.35rem'}
    height={'1.35rem'}
    fill={'none'}
    stroke={'currentColor'}
    strokeWidth={'2'}
    strokeLinecap={'round'}
    strokeLinejoin={'round'}
    aria-hidden={true}
    {...props}
  >
    <path d={'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8'} />
    <path d={'M21 3v5h-5'} />
    <path d={'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16'} />
    <path d={'M3 21v-5h5'} />
  </svg>
)
