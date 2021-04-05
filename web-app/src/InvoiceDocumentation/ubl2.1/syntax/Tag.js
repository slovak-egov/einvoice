import {Fragment} from 'react'
import {Link, useLocation} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {last} from 'lodash'
import {Table} from '../../../helpers/idsk'
import NotFound from '../../../helpers/NotFound'
import {displayCardinality, getTagDocs} from './helpers'

const TagDescendantsTable = ({descendants, attributes}) => {
  const {i18n, t} = useTranslation('common')
  const location = useLocation()

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
      rows={Object.entries(descendants).map(([name, child]) => {
        // Add @ for attributes in URL, so we can distinguish attributes from children
        const childName = `${attributes ? '@' : ''}${name}`
        return [
          {
            children: displayCardinality(child.cardinality),
            style: {width: '5%'},
          },
          {
            children: <Link to={`${location.pathname}/${childName}`}>{childName}</Link>,
            style: {width: '15%'},
          },
          {
            children: (
              <>
                <strong>{child.name[i18n.language]}</strong>
                <div>{child.description[i18n.language]}</div>
              </>
            ),
            className: 'd-none-mobile',
          },
        ]
      })}
    />
  )
}

export default ({rootDocs}) => {
  const {i18n, t} = useTranslation('common')
  const location = useLocation()

  const tagPath = location.pathname.split('/').slice(3)
  const docs = getTagDocs(rootDocs, tagPath)

  // Tag does not exist in invoice documentation
  if (docs == null) return <NotFound />

  return (
    <>
      <h1 className="govuk-heading-l">{last(tagPath)}</h1>
      <p className="lead">{docs.description[i18n.language]}</p>
      <div className="govuk-grid-row">
        <strong className="govuk-grid-column-one-quarter">{t('invoiceDocs.name')}</strong>
        <div className="govuk-grid-column-three-quarters">{docs.name[i18n.language]}</div>
      </div>
      <div className="govuk-grid-row">
        <strong className="govuk-grid-column-one-quarter">{t('invoiceDocs.cardinality.full')}</strong>
        <div className="govuk-grid-column-three-quarters">{displayCardinality(docs.cardinality)}</div>
      </div>
      {docs.dataType && <div className="govuk-grid-row">
        <strong className="govuk-grid-column-one-quarter">{t('invoiceDocs.dataType')}</strong>
        <div className="govuk-grid-column-three-quarters">{docs.dataType}</div>
      </div>}
      {docs.defaultValue && <div className="govuk-grid-row">
        <strong className="govuk-grid-column-one-quarter">{t('invoiceDocs.defaultValue')}</strong>
        <div className="govuk-grid-column-three-quarters">{docs.defaultValue}</div>
      </div>}
      {docs.businessTerms && <div className="govuk-grid-row">
        <strong className="govuk-grid-column-one-quarter">{t('invoiceDocs.businessTerms')}</strong>
        <div className="govuk-grid-column-three-quarters">
          {docs.businessTerms.map((term, i) => (
            <Fragment key={i}>
              {i !== 0 && <span>, </span>}
              <Link to={`/invoiceDocumentation/businessTerms/${term}`}>{term}</Link>
            </Fragment>
          ))}
        </div>
      </div>}
      {docs.codeLists && <div className="govuk-grid-row">
        <strong className="govuk-grid-column-one-quarter">{t('invoiceDocs.codeLists')}</strong>
        <div className="govuk-grid-column-three-quarters">
          {docs.codeLists.map((codeList, i) => (
            <Fragment key={i}>
              {i !== 0 && <span>, </span>}
              <Link to={`/invoiceDocumentation/codeLists/${codeList}`}>{codeList}</Link>
            </Fragment>
          ))}
        </div>
      </div>}
      {docs.rules && <div className="govuk-grid-row">
        <strong className="govuk-grid-column-one-quarter">{t('invoiceDocs.rules.title')}</strong>
        <div className="govuk-grid-column-three-quarters">
          {docs.rules.map((ruleId, i) => (
            <Fragment key={i}>
              {i !== 0 && <span>, </span>}
              <Link to={`/invoiceDocumentation/ublRules/${ruleId}`}>{ruleId}</Link>
            </Fragment>
          ))}
        </div>
      </div>}
      {docs.attributes && <div className="govuk-grid-row">
        <strong className="govuk-grid-column-one-quarter">{t('invoiceDocs.attributes')}</strong>
        <div className="govuk-grid-column-three-quarters">
          <TagDescendantsTable descendants={docs.attributes} attributes />
        </div>
      </div>}
      {docs.children && <div className="govuk-grid-row">
        <strong className="govuk-grid-column-one-quarter">{t('invoiceDocs.childElements')}</strong>
        <div className="govuk-grid-column-three-quarters">
          <TagDescendantsTable descendants={docs.children} />
        </div>
      </div>}
    </>
  )
}
