import {Fragment} from 'react'
import {useSelector} from 'react-redux'
import {useTranslation} from 'react-i18next'
import {Link} from 'react-router-dom'
import {Card, Col, Row, Table} from 'react-bootstrap'
import NotFound from '../../helpers/NotFound'
import {businessTermsDocsSelector} from '../../cache/documentation/state'
import {displayCardinality} from '../ubl2.1/syntax/helpers'

const ChildrenTable = ({childrenIds}) => {
  const {i18n, t} = useTranslation('common')
  const businessTerms = useSelector(businessTermsDocsSelector)

  return (
    <Table striped hover responsive size="sm">
      <thead>
        <tr>
          <th>{t('invoiceDocs.cardinality.short')}</th>
          <th>{t('invoiceDocs.name')}</th>
          <th>{t('invoiceDocs.description')}</th>
        </tr>
      </thead>
      <tbody>
        {childrenIds.map((id) => (
          <tr key={id}>
            <td>{displayCardinality(businessTerms[id].cardinality)}</td>
            <td>
              <Link to={`/invoiceDocumentation/businessTerms/${id}`}>{id}</Link>
            </td>
            <td>{businessTerms[id].description[i18n.language]}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

export default ({data, id}) => {
  const {i18n, t} = useTranslation('common')
  // Non-existent business term
  if (data == null) return <NotFound />

  return (
    <Card>
      <Card.Header className="bg-primary text-white text-center" as="h3">
        {data.name[i18n.language]}
      </Card.Header>
      <Card.Body>
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
      </Card.Body>
    </Card>
  )
}
