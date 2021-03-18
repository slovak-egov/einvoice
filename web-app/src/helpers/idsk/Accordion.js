import {useEffect, useRef} from 'react'
import classNames from 'classnames'
import AccordionJS from '@id-sk/frontend/govuk/components/accordion/accordion'

export default ({items, className, ...props}) => {
  const accordionRef = useRef()

  useEffect(() => {
    new AccordionJS(accordionRef.current).init()
  }, [accordionRef])

  const innerHtml = items.map((item, index) => (
    <div
      key={index}
      className={classNames(
        'govuk-accordion__section', item.expanded && 'govuk-accordion__section--expanded',
      )}
    >
      <div className="govuk-accordion__section-header">
        <h2 className="govuk-accordion__section-heading">
          <span
            className="govuk-accordion__section-button"
            id={`${props.id}-heading-${index + 1}`}
          >
            {item.heading.children}
          </span>
        </h2>
        {item.summary && (
          <div
            className="govuk-accordion__section-summary govuk-body"
            id={`${props.id}-summary-${index + 1}`}
          >
            {item.summary.children}
          </div>
        )}
      </div>
      <div
        id={`${props.id}-content-${index + 1}`}
        className="govuk-accordion__section-content"
        aria-labelledby={`${props.id}-heading-${index + 1}`}
      >
        {item.content.children}
      </div>
    </div>
  ))
  return (
    <div
      {...props}
      className={classNames('govuk-accordion', className)}
      data-module="govuk-accordion"
      ref={accordionRef}
    >
      {innerHtml}
    </div>
  )
}
