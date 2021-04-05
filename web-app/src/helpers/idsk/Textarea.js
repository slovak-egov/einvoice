import React from 'react'
import classNames from 'classnames'
import {Label, Hint, ErrorMessage} from '.'

const Textarea = (
  {className, 'aria-describedby': describedBy, errorMessage, formGroup, hint, label, id, ...props},
  ref,
) => {
  let describedByValue = describedBy
  let hintComponent
  let errorMessageComponent

  if (hint) {
    const hintId = `${id}-hint`
    describedByValue += ` ${hintId}`
    hintComponent = <Hint {...hint} id={hintId} />
  }

  if (errorMessage) {
    const errorId = id ? `${id}-error` : ''
    describedByValue += ` ${errorId}`
    errorMessageComponent = <ErrorMessage {...errorMessage} id={errorId} />
  }

  return (
    <div
      className={classNames('govuk-form-group', errorMessage && 'govuk-form-group--error', formGroup?.className)}
    >
      <Label {...label} htmlFor={id} />
      {hintComponent}
      {errorMessageComponent}
      <textarea
        {...props}
        id={id}
        ref={ref}
        className={classNames('govuk-textarea', errorMessage && 'govuk-textarea--error', className)}
        aria-describedby={describedByValue.trim() || null}
      />
    </div>
  )
}

export default React.forwardRef(Textarea)
