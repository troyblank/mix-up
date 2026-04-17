import type { FunctionComponent, SVGProps } from 'react'

import { SVG_NAMESPACE } from './utils'

export const DeleteIcon: FunctionComponent<SVGProps<SVGSVGElement>> = (
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
    <path d={'M3 6h18'} />
    <path d={'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6'} />
    <path d={'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'} />
    <path d={'M10 11v6'} />
    <path d={'M14 11v6'} />
  </svg>
)
