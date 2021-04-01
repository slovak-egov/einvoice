import classNames from 'classnames'

export default ({className, children, ...props}) => (
  <div className={classNames('govuk-hint', className)} {...props}>
    {children}
  </div>
)
