import {Fragment, useEffect, useRef} from 'react'
import classNames from 'classnames'
import {omit} from 'lodash'
import RadiosJS from '@id-sk/frontend/govuk/components/radios/radios'
import CheckboxesJS from '@id-sk/frontend/govuk/components/checkboxes/checkboxes'
import {ErrorMessage, FieldSet, Hint, Label} from '.'

export default ({
  className, errorMessage, fieldset, formGroup, hint, idPrefix, items, controlType, name,
  onChange, onBlur, 'aria-describedby': describedByProp, ...props
}) => {
  const controlRef = useRef()
  const idPrefixValue = idPrefix || name
  let describedBy = describedByProp || ''
  if (fieldset?.['aria-describedby']) {
    describedBy = fieldset['aria-describedby']
  }

  let hintComponent
  let errorMessageComponent

  useEffect(() => {
    if (controlType === 'radios') new RadiosJS(controlRef.current).init()
    else new CheckboxesJS(controlRef.current).init()
  }, [controlRef, controlType])

  if (hint) {
    const hintId = `${idPrefixValue}-hint`
    describedBy += ` ${hintId}`

    hintComponent = <Hint {...hint} id={hintId} />
  }

  // Find out if we have any conditional items
  const isConditional =
    items && items.find((item) => item?.conditional?.children)
  const hasFieldset = !!fieldset

  if (errorMessage) {
    const errorId = `${idPrefixValue}-error`
    describedBy += ` ${errorId}`
    errorMessageComponent = <ErrorMessage {...errorMessage} id={errorId} />
  }

  const innerHtml = (
    <>
      {hintComponent}
      {errorMessageComponent}

      <div
        className={classNames(
          `govuk-${controlType}`, controlType === 'radios' && isConditional && 'govuk-radios--conditional', className)
        }
        {...props}
        ref={controlRef}
        data-module={isConditional && `govuk-${controlType}`}
      >
        {items.map((item, index) => {
          if (!item) {
            return null
          }

          const {
            id,
            children,
            hint: itemHint,
            conditional: itemConditional,
            label,
            ...itemAttributes
          } = item

          const idSuffix = `-${index + 1}`
          const idValue =
            id || `${idPrefixValue}${index === 0 ? '' : idSuffix}`
          const nameValue = item.name || name
          const conditionalId = itemConditional?.children
            ? `conditional-${idValue}`
            : null
          const itemHintId = `${idValue}-item-hint`

          let itemDescribedBy = ''

          if (controlType === 'checkboxes' && !hasFieldset) {
            itemDescribedBy = describedBy
          }

          if (itemHint) {
            itemDescribedBy += ` ${itemHintId}`
          }

          if (item.divider) {
            return (
              <div
                key={index}
                className={`govuk-${controlType}__divider`}
              >
                {item.divider}
              </div>
            )
          }

          return (
            <Fragment key={index}>
              <div className={`govuk-${controlType}__item`}>
                <input
                  className={`govuk-${controlType}__input`}
                  id={idValue}
                  name={nameValue}
                  type={controlType === 'radios' ? 'radio' : 'checkbox'}
                  data-aria-controls={conditionalId}
                  aria-describedby={itemDescribedBy || null}
                  onChange={onChange}
                  onBlur={onBlur}
                  {...itemAttributes}
                />
                <Label
                  {...{
                    ...label,
                    className: classNames(`govuk-${controlType}__label`, label?.className),
                    htmlFor: idValue,
                    isPageHeading: false,
                  }}
                >
                  {children}
                </Label>
                {itemHint && (
                  <Hint
                    {...itemHint}
                    className={classNames(`govuk-${controlType}__hint`, itemHint.className)}
                    id={itemHintId}
                  />
                )}
              </div>

              {itemConditional?.children && (
                <div
                  className={classNames(
                    `govuk-${controlType}__conditional`, !item.checked && `govuk-${controlType}__conditional--hidden`
                  )}
                  id={conditionalId}
                >
                  {itemConditional.children}
                </div>
              )}
            </Fragment>
          )
        })}
      </div>
    </>
  )

  return (
    <div
      className={classNames(
        'govuk-form-group', errorMessage && 'govuk-form-group--error', formGroup?.className,
      )}
    >
      {hasFieldset ? (
        <FieldSet
          {...omit(fieldset, ['role'])}
          aria-describedby={describedBy.trim() || null}
        >
          {innerHtml}
        </FieldSet>
      ) : (
        innerHtml
      )}
    </div>
  )
}
