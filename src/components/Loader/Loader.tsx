import type { FunctionComponent } from 'react'
import { LoaderWrapper, Spinner, LoaderLabel } from './Loader.styles'

type LoaderProps = {
  text: string
  inButton?: boolean
}

export const Loader: FunctionComponent<LoaderProps> = ({
  text,
  inButton = false,
}) => {
  return (
    <LoaderWrapper $inButton={inButton} aria-busy={'true'} aria-live={'polite'}>
      <Spinner $inButton={inButton} aria-hidden={'true'} />
      <LoaderLabel>{text}</LoaderLabel>
    </LoaderWrapper>
  )
}
