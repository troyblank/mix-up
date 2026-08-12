import type { FunctionComponent, SVGProps } from 'react'

import { SVG_NAMESPACE } from './utils'

export const ListIcon: FunctionComponent<SVGProps<SVGSVGElement>> = (props) => (
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
    <path d={'M9 6h11'} />
    <path d={'M9 12h11'} />
    <path d={'M9 18h11'} />
    <circle cx={'4'} cy={'6'} r={'1'} />
    <circle cx={'4'} cy={'12'} r={'1'} />
    <circle cx={'4'} cy={'18'} r={'1'} />
  </svg>
)
