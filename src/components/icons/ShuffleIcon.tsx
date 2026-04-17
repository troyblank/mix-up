import type { FunctionComponent, SVGProps } from 'react'

import { SVG_NAMESPACE } from './utils'

export const ShuffleIcon: FunctionComponent<SVGProps<SVGSVGElement>> = (
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
    <path d={'M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22'} />
    <path d={'m18 2 4 4-4 4'} />
    <path d={'M2 6h1.9c1.5 0 2.9.9 3.6 2.2'} />
    <path d={'M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8'} />
    <path d={'m18 14 4 4-4 4'} />
  </svg>
)
