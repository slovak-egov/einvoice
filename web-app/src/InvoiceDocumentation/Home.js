import {Link} from 'react-router-dom'
import {Button, Card, Row} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'

export default ({match}) => {
  const {t} = useTranslation('common')
  return (
    <Card>
      <Card.Header className="bg-primary text-white text-center" as="h3">
        {t('invoiceDocumentation')}
      </Card.Header>
      <Card.Body>
        <Row className="justify-content-center">
          <Link to={`${match.url}/ublInvoice`}>
            <Button variant="primary">
              UBL2.1 {t('invoiceTypes.invoice')}
            </Button>
          </Link>
          <Link to={`${match.url}/ublCreditNote`}>
            <Button variant="success">
              UBL2.1 {t('invoiceTypes.creditNote')}
            </Button>
          </Link>
        </Row>
        <Row className="justify-content-center">
          <Link to={`${match.url}/ublRules`}>
            <Button variant="warning">
              {t('invoiceDocs.ublRules')}
            </Button>
          </Link>
          <Link to={`${match.url}/codeLists`}>
            <Button variant="secondary">
              {t('invoiceDocs.codeLists')}
            </Button>
          </Link>
        </Row>
        <Row className="justify-content-center">
          <Link to={`${match.url}/businessTerms`}>
            <Button variant="danger">
              {t('invoiceDocs.businessTerms')}
            </Button>
          </Link>
        </Row>
      </Card.Body>
    </Card>
  )
}
