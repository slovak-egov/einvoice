import classNames from 'classnames'

export default ({className, children, visuallyHiddenText, ...props}) => (
  <span className={classNames('govuk-error-message', className)} {...props}>
    {visuallyHiddenText && <span className="govuk-visually-hidden">{visuallyHiddenText}: </span>}
    {children}
  </span>
)
