import classNames from 'classnames'

export default ({legend, className, children, ...props}) => (
  <fieldset className={classNames('govuk-fieldset', className)} {...props}>
    {legend && legend.children &&
      <legend className={classNames('govuk-fieldset__legend', legend.className)}>
        {legend.isPageHeading ? (
          <h1 className="govuk-fieldset__heading">{legend.children}</h1>
        ) : (
          legend.children
        )}
      </legend>
    }
    {children}
  </fieldset>
)
