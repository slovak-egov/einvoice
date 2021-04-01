import {useEffect, useRef} from 'react'
import classNames from 'classnames'
import ButtonJS from '@id-sk/frontend/idsk/components/button/button'
import Link from './Link'

export default ({
  href, to, isStartButton, disabled, className, preventDoubleClick, name, type, children, ...props
}) => {
  const buttonRef = useRef()

  useEffect(() => {
    new ButtonJS(buttonRef.current).init()
  }, [buttonRef])

  let buttonAttributes = {
    name,
    type,
    'data-module': 'govuk-button',
    ...props,
  }

  let iconHtml
  if (isStartButton) {
    iconHtml = (
      <svg
        className="govuk-button__start-icon"
        xmlns="http://www.w3.org/2000/svg"
        width="17.5"
        height="19"
        viewBox="0 0 33 40"
        aria-hidden="true"
        focusable="false"
      >
        <path fill="currentColor" d="M0 0h13l20 20-20 20H0l20-20z" />
      </svg>
    )
  }

  const commonAttributes = {
    className: classNames(
      'govuk-button',
      className,
      disabled && 'govuk-button--disabled',
      isStartButton && 'govuk-button--start',
    ),
    ref: buttonRef,
  }

  if (preventDoubleClick) {
    buttonAttributes['data-prevent-double-click'] = preventDoubleClick
  }

  if (disabled) {
    buttonAttributes = {
      ...buttonAttributes,
      'aria-disabled': true,
      'disabled': 'disabled',
    }
  }

  if (href || to) {
    const linkAttributes = {
      ...commonAttributes,
      'role': 'button',
      'draggable': 'false',
      ...props,
      'data-module': 'govuk-button',
      href,
      to,
    }

    return (
      <Link {...linkAttributes}>
        {children}
        {iconHtml}
      </Link>
    )
  } else {
    return (
      <button {...buttonAttributes} {...commonAttributes}>
        {children}
        {iconHtml}
      </button>
    )
  }
}
