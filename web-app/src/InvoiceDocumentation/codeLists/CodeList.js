import {Card, Col, Row} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'
import NotFound from '../../helpers/NotFound'

export default ({data, identifier}) => {
  const {i18n, t} = useTranslation('common')
  // Non-existent code list
  if (data == null) return <NotFound />
  return (
    <Card>
      <Card.Header className="bg-primary text-white text-center" as="h3">
        {data.title[i18n.language]}
      </Card.Header>
      <Card.Body>
        <Row>
          <Col className="font-weight-bold" sm="3">{t('invoiceDocs.identifier')}</Col>
          <Col sm="9">{identifier}</Col>
        </Row>
        <Row>
          <Col className="font-weight-bold" sm="3">{t('invoiceDocs.agency')}</Col>
          <Col sm="9">{data.agency}</Col>
        </Row>
        {data.version && <Row>
          <Col className="font-weight-bold" sm="3">{t('invoiceDocs.version')}</Col>
          <Col sm="9">{data.version}</Col>
        </Row>}
        <Row>
          <Col className="font-weight-bold" sm="3">{t('invoiceDocs.codes')}</Col>
          <Col sm="9">
            {Object.entries(data.codes).map(([code, {name, description}], index) => (
              <div key={index} className="my-2 d-flex flex-column">
                <code>{code}</code>
                <strong>{name[i18n.language]}</strong>
                {description && <p>{description[i18n.language]}</p>}
              </div>
            ))}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}
