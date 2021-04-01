import {useLocation} from 'react-router-dom'
import classNames from 'classnames'
import Link from './Link'

export default ({className, children, tabs, ...props}) => {
  const {pathname} = useLocation()
  return (
    <div
      className={classNames('govuk-tabs', className)}
      {...props}
      data-module="govuk-tabs"
    >
      <ul className="govuk-tabs__list">
        {tabs.map(({label, to}, index) => (
          <li
            key={index}
            className={
              classNames('govuk-tabs__list-item', pathname.startsWith(to) && 'govuk-tabs__list-item--selected')
            }
          >
            <Link className="govuk-tabs__tab" to={to}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="govuk-tabs__panel">
        {children}
      </div>
    </div>
  )
}
