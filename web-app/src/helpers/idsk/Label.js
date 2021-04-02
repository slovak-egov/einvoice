import classNames from 'classnames'

export default ({className, htmlFor, children, isPageHeading, ...props}) => {
  // If no children, just don't output anything
  if (!children) {
    return null
  }

  const label = (
    <label
      className={classNames('govuk-label', className)}
      {...props}
      htmlFor={htmlFor}
    >
      {children}
    </label>
  )

  if (isPageHeading === true) {
    return <h1 className="govuk-label-wrapper">{label}</h1>
  }

  return label
}
