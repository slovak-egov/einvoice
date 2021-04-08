import {Fragment} from 'react'
import {useSelector} from 'react-redux'
import {useTranslation} from 'react-i18next'
import {Link} from 'react-router-dom'
import {Table} from '../../helpers/idsk'
import NotFound from '../../helpers/NotFound'
import {businessTermsDocsSelector} from '../../cache/documentation/state'
import {displayCardinality} from '../ubl2.1/syntax/helpers'

const ChildrenTable = ({childrenIds}) => {
  const {i18n, t} = useTranslation('common')
  const businessTerms = useSelector(businessTermsDocsSelector)

  return (
    <Table
      head={[
        {children: t('invoiceDocs.cardinality.short')},
        {children: t('invoiceDocs.name')},
        {
          children: t('invoiceDocs.description'),
          className: 'd-none-mobile',
        },
      ]}
      rows={childrenIds.map((id) => [
        {
          children: displayCardinality(businessTerms[id].cardinality),
          style: {width: '5%'},
        },
        {
          children: <Link to={`/invoiceDocumentation/businessTerms/${id}`}>{id}</Link>,
          style: {width: '15%'},
        },
        {
          children: businessTerms[id].description[i18n.language],
          className: 'd-none-mobile',
        },
      ])}
    />
  )
}

export default ({data, id}) => {
  const {i18n, t} = useTranslation('common')
  // Non-existent business term
  if (data == null) return <NotFound />

  return (
    <>
      <h1 className="govuk-heading-l">{data.name[i18n.language]}</h1>
      <p className="lead">{data.description[i18n.language]}</p>
      <div className="govuk-grid-row">
        <strong className="govuk-grid-column-one-quarter">{t('invoiceDocs.identifier')}</strong>
        <div className="govuk-grid-column-three-quarters">{id}</div>
      </div>
      <div className="govuk-grid-row">
        <strong className="govuk-grid-column-one-quarter">{t('invoiceDocs.cardinality.full')}</strong>
        <div className="govuk-grid-column-three-quarters">{displayCardinality(data.cardinality)}</div>
      </div>
      {data.dataType && <div className="govuk-grid-row">
        <strong className="govuk-grid-column-one-quarter">{t('invoiceDocs.dataType')}</strong>
        <div className="govuk-grid-column-three-quarters">{data.dataType}</div>
      </div>}
      {data.codeLists && <div className="govuk-grid-row">
        <strong className="govuk-grid-column-one-quarter">{t('invoiceDocs.codeLists')}</strong>
        <div className="govuk-grid-column-three-quarters">
          {data.codeLists.map((codeList, i) => (
            <Fragment key={i}>
              {i !== 0 && <span>, </span>}
              <Link to={`/invoiceDocumentation/codeLists/${codeList}`}>{codeList}</Link>
            </Fragment>
          ))}
        </div>
      </div>}
      {data.rules && <div className="govuk-grid-row">
        <strong className="govuk-grid-column-one-quarter">{t('invoiceDocs.rules.title')}</strong>
        <div className="govuk-grid-column-three-quarters">
          {data.rules.map((ruleId, i) => (
            <Fragment key={i}>
              {i !== 0 && <span>, </span>}
              <Link to={`/invoiceDocumentation/ublRules/${ruleId}`}>{ruleId}</Link>
            </Fragment>
          ))}
        </div>
      </div>}
      {data.children && <div className="govuk-grid-row">
        <strong className="govuk-grid-column-one-quarter">{t('invoiceDocs.childElements')}</strong>
        <div className="govuk-grid-column-three-quarters">
          <ChildrenTable childrenIds={data.children} />
        </div>
      </div>}
    </>
  )
}
