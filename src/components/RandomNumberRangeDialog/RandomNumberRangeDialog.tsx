import type { FormEvent, FunctionComponent } from 'react'
import { useEffect, useId, useState } from 'react'

import { PrimaryButton, SecondaryButton } from '../AppButton'
import { Actions, Dialog, DialogTitle } from '../Dialog'
import {
  CheckboxControl,
  CheckboxField,
  CheckboxInput,
  CheckboxLabel,
  CheckboxText,
  Divider,
  ErrorText,
  Field,
  Input,
  Label,
  Result,
} from './RandomNumberRangeDialog.styles'
import { randomInclusiveInteger } from '../../utils/random'

const STORAGE_MIN_KEY = 'mix-up.random-number-range.min'
const STORAGE_MAX_KEY = 'mix-up.random-number-range.max'
const STORAGE_REDUCE_MAX_KEY = 'mix-up.random-number-range.reduce-max-after-pick'
const DEFAULT_MIN = '1'
const DEFAULT_MAX = '10'

const readStoredMinMax = (): { min: string; max: string } => {
  try {
    const min = window.localStorage.getItem(STORAGE_MIN_KEY)
    const max = window.localStorage.getItem(STORAGE_MAX_KEY)
    return {
      min: min ?? DEFAULT_MIN,
      max: max ?? DEFAULT_MAX,
    }
  } catch {
    return { min: DEFAULT_MIN, max: DEFAULT_MAX }
  }
}

const writeStoredMinMax = (min: string, max: string) => {
  try {
    window.localStorage.setItem(STORAGE_MIN_KEY, min)
    window.localStorage.setItem(STORAGE_MAX_KEY, max)
  } catch {
    // Ignore issues.
  }
}

const readStoredReduceMaxAfterPick = (): boolean => {
  try {
    return window.localStorage.getItem(STORAGE_REDUCE_MAX_KEY) === 'true'
  } catch {
    return false
  }
}

const writeStoredReduceMaxAfterPick = (value: boolean) => {
  try {
    window.localStorage.setItem(STORAGE_REDUCE_MAX_KEY, value ? 'true' : 'false')
  } catch {
    // Ignore issues.
  }
}

export type RandomNumberRangeDialogProps = {
  isOpen: boolean
  onClose: () => void
}

export const RandomNumberRangeDialog: FunctionComponent<
  RandomNumberRangeDialogProps
> = ({ isOpen, onClose }) => {
  const titleId = useId()
  const minId = useId()
  const maxId = useId()
  const reduceMaxId = useId()
  const [{ min: minInput, max: maxInput }, setRangeInputs] =
    useState(readStoredMinMax)
  const [reduceMaxAfterPick, setReduceMaxAfterPick] = useState(
    readStoredReduceMaxAfterPick,
  )
  const [result, setResult] = useState<number | null>(null)
  const [pickGeneration, setPickGeneration] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    writeStoredMinMax(minInput, maxInput)
  }, [minInput, maxInput])

  useEffect(() => {
    writeStoredReduceMaxAfterPick(reduceMaxAfterPick)
  }, [reduceMaxAfterPick])

  useEffect(() => {
    if (!isOpen) return

    setResult(null)
    setPickGeneration(0)
    setError(null)
  }, [isOpen])

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
    setResult(randomInclusiveInteger(min, max))
    if (reduceMaxAfterPick && max > 1) {
      setRangeInputs((previous) => ({
        ...previous,
        max: String(max - 1),
      }))
    }
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    pick()
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      ariaLabelledBy={titleId}
      backdropTestId={'random-range-backdrop'}
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
            onChange={(event) =>
              setRangeInputs((previous) => ({
                ...previous,
                min: event.target.value,
              }))
            }
          />
        </Field>
        <Field>
          <Label htmlFor={maxId}>Maximum</Label>
          <Input
            id={maxId}
            type={'number'}
            inputMode={'numeric'}
            value={maxInput}
            onChange={(event) =>
              setRangeInputs((previous) => ({
                ...previous,
                max: event.target.value,
              }))
            }
          />
        </Field>
        <CheckboxField>
          <CheckboxLabel htmlFor={reduceMaxId}>
            <CheckboxControl>
              <CheckboxInput
                id={reduceMaxId}
                checked={reduceMaxAfterPick}
                onChange={(event) =>
                  setReduceMaxAfterPick(event.target.checked)
                }
              />
            </CheckboxControl>
            <CheckboxText>Remove selected number.</CheckboxText>
          </CheckboxLabel>
        </CheckboxField>
        <Divider aria-hidden={true} />
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
    </Dialog>
  )
}
