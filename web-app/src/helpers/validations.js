

const emptyFieldValidation = (value) => value === ''

const validation = (f) => {
  return {
    applicable: () => true,
    isViolation: f,
  }
}

export const getValidationFunction = (docs) => {
  if (docs.type === 'required') {
    return validation(emptyFieldValidation)
  }
  if (docs.type === 'requiredConditionally') {
    return {
      applicable: (condition) => docs.values.includes(condition),
      isViolation: emptyFieldValidation,
    }
  }
  if (docs.type === 'regex') {
    if (docs.type === 'regex') {
      return {
        applicable: (condition, value) => value !== '',
        isViolation: (value) => !value.match(new RegExp(docs.regex)),
      }
    }
  }
  return () => true
}
