import classNames from 'classnames'
import Tag from './Tag'

export default ({className, tag, children, ...props}) => (
  <div className={classNames('govuk-phase-banner', className)} {...props}>
    <p className="govuk-phase-banner__content">
      <Tag
        className={classNames('govuk-phase-banner__content__tag', tag?.className)}
      >
        {tag && tag.children}
      </Tag>

      <span className="govuk-phase-banner__text">{children}</span>
    </p>
  </div>
)
