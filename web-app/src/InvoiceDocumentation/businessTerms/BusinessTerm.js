import {Fragment} from 'react'
import {useSelector} from 'react-redux'
import {useTranslation} from 'react-i18next'
import {Link} from 'react-router-dom'
import {Col, Row} from 'react-bootstrap'
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
      <Row>
        <Col className="font-weight-bold" sm="3">{t('invoiceDocs.identifier')}</Col>
        <Col sm="9">{id}</Col>
      </Row>
      <Row>
        <Col className="font-weight-bold" sm="3">{t('invoiceDocs.cardinality.full')}</Col>
        <Col sm="9">{displayCardinality(data.cardinality)}</Col>
      </Row>
      {data.dataType && <Row>
        <Col className="font-weight-bold" sm="3">{t('invoiceDocs.dataType')}</Col>
        <Col sm="9">{data.dataType}</Col>
      </Row>}
      {data.codeLists && <Row>
        <Col className="font-weight-bold" sm="3">{t('invoiceDocs.codeLists')}</Col>
        <Col sm="9">
          {data.codeLists.map((codeList, i) => (
            <Fragment key={i}>
              {i !== 0 && <span>, </span>}
              <Link to={`/invoiceDocumentation/codeLists/${codeList}`}>{codeList}</Link>
            </Fragment>
          ))}
        </Col>
      </Row>}
      {data.children && <Row>
        <Col className="font-weight-bold" sm="3">{t('invoiceDocs.childElements')}</Col>
        <Col sm="9">
          <ChildrenTable childrenIds={data.children} />
        </Col>
      </Row>}
    </>
  )
}
