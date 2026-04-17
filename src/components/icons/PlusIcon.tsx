import type { FunctionComponent, SVGProps } from 'react'

import { SVG_NAMESPACE } from './utils'

export const PlusIcon: FunctionComponent<SVGProps<SVGSVGElement>> = (
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
    <path d={'M12 5v14'} />
    <path d={'M5 12h14'} />
  </svg>
)
