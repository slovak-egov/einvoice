import {useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Button, Card, Col, Form, Row} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'
import {format as formatDate, parseISO} from 'date-fns'
import NotFound from './helpers/NotFound'
import BoolIcon from './helpers/BoolIcon'
import {getInvoiceMeta} from '../actions/invoices'
import {getInvoiceSelector} from '../state/invoices'
import {invoiceDownloadXmlUrl, invoiceDownloadZipUrl} from '../utils/constants'

const TextField = ({label, value}) => (
  <Form.Group>
    <Form.Label>{label}</Form.Label>
    <Form.Control
      value={value}
      readOnly
    />
  </Form.Group>
)

const CheckboxField = ({label, value}) => (
  <Form.Group>
    <Form.Label>{label}</Form.Label>
    <BoolIcon value={value} />
  </Form.Group>
)

export default ({history, match: {params: {id}}}) => {
  const {t} = useTranslation(['common', 'invoices'])
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getInvoiceMeta(id))
  }, [dispatch, id])

  const invoice = useSelector(getInvoiceSelector(id))

  // Data are still not loaded
  if (invoice == null) {
    return null
  }

  if (invoice.notFound) {
    return <NotFound />
  }

  const {
    createdAt, customerIco, format, isPublic, issueDate, notificationsSent, price, receiver,
    sender, supplierIco, test,
  } = invoice

  return (
    <Card className="m-1">
      <Card.Header className="bg-primary text-white text-center" as="h3" style={{display: 'grid'}}>
        <div style={{gridRowStart: 1, gridColumnStart: 1, justifySelf: 'center'}}>
          {t('invoice')} {id}
        </div>
        <div style={{gridRowStart: 1, gridColumnStart: 1, justifySelf: 'right'}}>
          <Button variant="danger" onClick={history.goBack}>{t('close')}</Button>
        </div>
      </Card.Header>
      <Card.Body>
        <div>
          <Row>
            <Col>
              <TextField label={t('invoices:sender')} value={sender} />
            </Col>
            <Col>
              <TextField label={t('invoices:supplierIco')} value={supplierIco} />
            </Col>
          </Row>
          <Row>
            <Col>
              <TextField label={t('invoices:receiver')} value={receiver} />
            </Col>
            <Col>
              <TextField label={t('invoices:customerIco')} value={customerIco} />
            </Col>
          </Row>
          <Row>
            <Col>
              <TextField
                label={t('invoices:createdAt')}
                value={formatDate(parseISO(createdAt), 'yyyy-MM-dd HH:mm')}
              />
            </Col>
            <Col>
              <TextField label={t('invoices:issueDate')} value={issueDate} />
            </Col>
            <Col>
              <TextField label={t('format')} value={format} />
            </Col>
          </Row>
          <Row>
            <Col>
              <TextField label={t('invoices:price')} value={price} />
            </Col>
            <Col>
              <CheckboxField label="Test" value={test} />
            </Col>
            <Col>
              <CheckboxField label={t('invoices:public')} value={isPublic} />
            </Col>
            <Col>
              <CheckboxField label={t('invoices:notificationsSent')} value={notificationsSent} />
            </Col>
          </Row>
        </div>
        <Row className="justify-content-center">
          <Button variant="primary" href={invoiceDownloadXmlUrl(id)}>
            {`${t('download')} XML`}
          </Button>
          <Button variant="success" href={invoiceDownloadZipUrl(id)}>
            {`${t('download')} ZIP`}
          </Button>
        </Row>
      </Card.Body>
    </Card>
  )
}