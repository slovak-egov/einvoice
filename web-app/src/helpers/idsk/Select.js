import React from 'react'
import classNames from 'classnames'
import {Label, Hint, ErrorMessage} from '.'

const Select = (
  {
    className, 'aria-describedby': describedBy, errorMessage, formGroup, hint,
    id, items, itemGroups, label, ...props
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

  return (
    <div
      className={classNames('govuk-form-group', errorMessage && 'govuk-form-group--error', formGroup?.className)}
    >
      <Label {...label} htmlFor={id} />
      {hintComponent}
      {errorMessageComponent}
      <select
        className={classNames('govuk-select', className, errorMessage && 'govuk-select--error')}
        id={id}
        ref={ref}
        aria-describedby={describedByValue || null}
        {...props}
      >
        {items && items.map(({children, ...optionAttributes}, index) => (
          <option {...optionAttributes} key={index}>
            {children}
          </option>
        ))}
        {itemGroups && itemGroups.map(({items, ...groupAttributes}, groupIndex) => (
          <optgroup key={groupIndex} {...groupAttributes}>
            {items.map(({children, ...itemAttributes}, itemIndex) => (
              <option key={itemIndex} {...itemAttributes}>{children}</option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  )
}

Select.displayName = 'Select'

export default React.forwardRef(Select)
