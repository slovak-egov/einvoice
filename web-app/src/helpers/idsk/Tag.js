import classNames from 'classnames'

export default ({children, className, ...props}) => (
  <strong className={classNames('govuk-tag', className)} {...props}>
    {children}
  </strong>
)
