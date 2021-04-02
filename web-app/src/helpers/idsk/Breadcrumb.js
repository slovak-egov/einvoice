import classNames from 'classnames'
import Link from './Link'

export default ({items, className, collapseOnMobile, ...props}) => {
  const breadcrumbs = items.map((item, index) => {
    const {href, to, children, ...itemAttributes} = item

    return href || to ? (
      <li
        key={index}
        className="govuk-breadcrumbs__list-item"
      >
        <Link
          href={href}
          to={to}
          className="govuk-breadcrumbs__link"
          {...itemAttributes}
        >
          {children}
        </Link>
      </li>
    ) : (
      <li
        key={index}
        className="govuk-breadcrumbs__list-item"
        aria-current="page"
      >
        {children}
      </li>
    )
  })

  return (
    <div
      className={classNames(
        'govuk-breadcrumbs', className, collapseOnMobile && 'govuk-breadcrumbs--collapse-on-mobile',
      )}
      {...props}
    >
      <ol className="govuk-breadcrumbs__list">{breadcrumbs}</ol>
    </div>
  )
}
