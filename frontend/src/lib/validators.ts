export type Validator = (value: string) => string | null

export function required(message = 'This field is required.'): Validator {
  return (value) => (value.trim().length === 0 ? message : null)
}

export function email(message = 'Enter a valid email address.'): Validator {
  return (value) => (value.trim().length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : message)
}

export function compose(...validators: Validator[]): Validator {
  return (value) => {
    for (const validate of validators) {
      const result = validate(value)
      if (result) return result
    }
    return null
  }
}
