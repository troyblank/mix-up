import type { FormEvent, FunctionComponent } from 'react'
import { useEffect, useId, useState } from 'react'

import {
  Actions,
  Backdrop,
  DialogTitle,
  ErrorText,
  Field,
  Input,
  Label,
  Overlay,
  Panel,
  PrimaryButton,
  Result,
  SecondaryButton,
} from './RandomNumberRangeDialog.styles'

export type RandomNumberRangeDialogProps = {
  isOpen: boolean
  onClose: () => void
}

function randomInclusiveInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const RandomNumberRangeDialog: FunctionComponent<
  RandomNumberRangeDialogProps
> = ({ isOpen, onClose }) => {
  const titleId = useId()
  const minId = useId()
  const maxId = useId()
  const [minInput, setMinInput] = useState('1')
  const [maxInput, setMaxInput] = useState('10')
  const [result, setResult] = useState<number | null>(null)
  const [pickGeneration, setPickGeneration] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return

    setResult(null)
    setPickGeneration(0)
    setError(null)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const pick = () => {
    const min = Number.parseInt(minInput, 10)
    const max = Number.parseInt(maxInput, 10)

    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      setError('Enter valid whole numbers for minimum and maximum.')
      setResult(null)
      return
    }

    if (min > max) {
      setError('Minimum must be less than or equal to maximum.')
      setResult(null)
      return
    }

    setError(null)
    setPickGeneration((previous) => previous + 1)
    setResult(randomInclusiveInt(min, max))
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    pick()
  }

  return (
    <Overlay role={'presentation'}>
      <Backdrop
        aria-hidden={true}
        data-testid={'random-range-backdrop'}
        onClick={onClose}
      />
      <Panel
        role={'dialog'}
        aria-modal={'true'}
        aria-labelledby={titleId}
      >
        <DialogTitle id={titleId}>Random number</DialogTitle>
        <form onSubmit={onSubmit}>
          <Field>
            <Label htmlFor={minId}>Minimum</Label>
            <Input
              id={minId}
              type={'number'}
              inputMode={'numeric'}
              value={minInput}
              onChange={(event) => setMinInput(event.target.value)}
            />
          </Field>
          <Field>
            <Label htmlFor={maxId}>Maximum</Label>
            <Input
              id={maxId}
              type={'number'}
              inputMode={'numeric'}
              value={maxInput}
              onChange={(event) => setMaxInput(event.target.value)}
            />
          </Field>
          {error != null && <ErrorText role={'alert'}>{error}</ErrorText>}
          {result != null && (
            <Result key={pickGeneration} aria-live={'polite'}>
              {result}
            </Result>
          )}
          <Actions>
            <PrimaryButton type={'submit'}>Pick</PrimaryButton>
            <SecondaryButton type={'button'} onClick={onClose}>
              Close
            </SecondaryButton>
          </Actions>
        </form>
      </Panel>
    </Overlay>
  )
}
