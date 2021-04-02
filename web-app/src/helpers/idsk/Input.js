import React from 'react'
import classNames from 'classnames'
import {Label, Hint, ErrorMessage} from '.'

const Input = (
  {
    className, 'aria-describedby': describedBy, errorMessage, formGroup, hint, label,
    name, id, prefix, suffix, ...props
  },
  ref,
) => {
  let describedByValue = describedBy || ''
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

  const input = (
    <input
      ref={ref}
      id={id}
      className={classNames('govuk-input', className, errorMessage && 'govuk-input--error')}
      name={name || id}
      aria-describedby={describedByValue || null}
      {...props}
    />
  )

  return (
    <div
      className={classNames(
        'govuk-form-group', formGroup?.className, errorMessage && 'govuk-form-group--error'
      )}
    >
      <Label {...label} htmlFor={id} />
      {hintComponent}
      {errorMessageComponent}
      {prefix || suffix ? (
        <div className="govuk-input__wrapper">
          {prefix && (
            <div
              aria-hidden="true"
              {...prefix}
              className={classNames('govuk-input__prefix', prefix.className)}
            />
          )}

          {input}

          {suffix && (
            <div
              aria-hidden="true"
              {...suffix}
              className={classNames('govuk-input__suffix', suffix.className)}
            />
          )}
        </div>
      ) : (
        input
      )}
    </div>
  )
}

Input.displayName = 'Input'

export default React.forwardRef(Input)
