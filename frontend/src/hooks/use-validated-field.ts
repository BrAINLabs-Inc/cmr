import { useState } from 'react'
import type { Validator } from '@/lib/validators'

// Gives a controlled field live validation feedback: an error only shows
// once the field has been touched (blurred, or a submit was attempted),
// not the instant an empty required field first renders. This is the piece
// that was missing everywhere — forms only surfaced problems after a full
// submit + network round trip instead of as the person types.
export function useValidatedField<T extends string = string>(initialValue: T, validate?: Validator) {
  const [value, setValue] = useState<T>(initialValue)
  const [touched, setTouched] = useState(false)

  const error = touched && validate ? validate(value) : null

  return {
    value,
    error,
    touched,
    setValue,
    // Accepts a plain string (e.g. from Radix Select's onValueChange, which
    // isn't generic over T) rather than forcing every caller to cast.
    onChange: (next: string) => setValue(next as T),
    onBlur: () => setTouched(true),
    markTouched: () => setTouched(true),
    isValid: !validate || !validate(value),
  }
}

export type ValidatedField = ReturnType<typeof useValidatedField>
