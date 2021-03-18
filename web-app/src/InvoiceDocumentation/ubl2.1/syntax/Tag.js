import {Fragment} from 'react'
import {Link, useLocation} from 'react-router-dom'
import {Col, Row} from 'react-bootstrap'
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
      <Row>
        <Col className="font-weight-bold" sm="3">{t('invoiceDocs.name')}</Col>
        <Col sm="9">{docs.name[i18n.language]}</Col>
      </Row>
      <Row>
        <Col className="font-weight-bold" sm="3">{t('invoiceDocs.cardinality.full')}</Col>
        <Col sm="9">{displayCardinality(docs.cardinality)}</Col>
      </Row>
      {docs.dataType && <Row>
        <Col className="font-weight-bold" sm="3">{t('invoiceDocs.dataType')}</Col>
        <Col sm="9">{docs.dataType}</Col>
      </Row>}
      {docs.defaultValue && <Row>
        <Col className="font-weight-bold" sm="3">{t('invoiceDocs.defaultValue')}</Col>
        <Col sm="9">{docs.defaultValue}</Col>
      </Row>}
      {docs.businessTerms && <Row>
        <Col className="font-weight-bold" sm="3">{t('invoiceDocs.businessTerms')}</Col>
        <Col sm="9">
          {docs.businessTerms.map((term, i) => (
            <Fragment key={i}>
              {i !== 0 && <span>, </span>}
              <Link to={`/invoiceDocumentation/businessTerms/${term}`}>{term}</Link>
            </Fragment>
          ))}
        </Col>
      </Row>}
      {docs.codeLists && <Row>
        <Col className="font-weight-bold" sm="3">{t('invoiceDocs.codeLists')}</Col>
        <Col sm="9">
          {docs.codeLists.map((codeList, i) => (
            <Fragment key={i}>
              {i !== 0 && <span>, </span>}
              <Link to={`/invoiceDocumentation/codeLists/${codeList}`}>{codeList}</Link>
            </Fragment>
          ))}
        </Col>
      </Row>}
      {docs.attributes && <Row>
        <Col className="font-weight-bold" sm="3">{t('invoiceDocs.attributes')}</Col>
        <Col sm="9">
          <TagDescendantsTable descendants={docs.attributes} attributes />
        </Col>
      </Row>}
      {docs.children && <Row>
        <Col className="font-weight-bold" sm="3">{t('invoiceDocs.childElements')}</Col>
        <Col sm="9">
          <TagDescendantsTable descendants={docs.children} />
        </Col>
      </Row>}
    </>
  )
}
