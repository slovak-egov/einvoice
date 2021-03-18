import classNames from 'classnames'

export default ({className, children, summary, ...props}) => (
  <details
    className={classNames('govuk-details', className)}
    {...props}
    data-module="govuk-details"
  >
    <summary className="govuk-details__summary">
      <span className="govuk-details__summary-text">{summary}</span>
    </summary>
    <div className="govuk-details__text">{children}</div>
  </details>
)
