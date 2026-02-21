import type { FunctionComponent } from 'react'
import { LoaderWrapper, Spinner, LoaderLabel } from './Loader.styles'

type LoaderProps = {
  text: string
}

export const Loader: FunctionComponent<LoaderProps> = ({ text }) => {
  return (
    <LoaderWrapper aria-busy="true" aria-live="polite">
      <Spinner aria-hidden="true" />
      <LoaderLabel>{text}</LoaderLabel>
    </LoaderWrapper>
  )
}
