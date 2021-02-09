import {Link} from 'react-router-dom'
import {Button, Card, Row} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'

export default ({match}) => {
  const {t} = useTranslation()
  return (
    <Card>
      <Card.Header className="bg-primary text-white text-center" as="h3">
        {t('invoiceDocumentation')}
      </Card.Header>
      <Card.Body>
        <Row className="justify-content-center">
          <Link to={`${match.url}/syntax/ubl:Invoice`}>
            <Button variant="primary">
              UBL2.1
            </Button>
          </Link>
          <Link to={`${match.url}/syntax/d16b`}>
            <Button variant="success" disabled>
              D16B
            </Button>
          </Link>
        </Row>
        <Row className="justify-content-center">
          <Link to={`${match.url}/codeLists`}>
            <Button variant="secondary">
              {t('invoiceDocs.codeLists')}
            </Button>
          </Link>
        </Row>
      </Card.Body>
    </Card>
  )
}
