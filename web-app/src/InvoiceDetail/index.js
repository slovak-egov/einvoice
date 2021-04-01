import {useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Button, Card, Col, Form, Row} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'
import {format as formatDate, parseISO} from 'date-fns'
import NotFound from '../helpers/NotFound'
import BoolIcon from '../helpers/BoolIcon'
import {getInvoiceSelector} from '../cache/invoices/state'
import {getInvoiceMeta} from '../cache/invoices/actions'
import {notificationStates} from '../utils/constants'
import {CONFIG} from '../appSettings'

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
  const {t} = useTranslation('common')
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
    createdAt, customerIco, format, issueDate, notificationsStatus, amount, amountCurrency,
    amountWithoutVat, amountWithoutVatCurrency, receiver, sender, supplierIco, test,
  } = invoice

  return (
    <Card className="m-1">
      <Card.Header className="bg-primary text-white text-center d-sm-flex" as="h3">
        <Col />
        <Col>{t('invoiceTypes.invoice')}</Col>
        <Col className="d-sm-flex">
          <Button className="ml-auto" variant="danger" onClick={history.goBack}>{t('close')}</Button>
        </Col>
      </Card.Header>
      <Card.Body>
        <div>
          <Row>
            <Col>
              <TextField label="ID" value={id} />
            </Col>
          </Row>
          <Row>
            <Col sm>
              <TextField label={t('invoice.supplier')} value={sender} />
            </Col>
            <Col sm>
              <TextField label={t('invoice.supplierIco')} value={supplierIco} />
            </Col>
          </Row>
          <Row>
            <Col sm>
              <TextField label={t('invoice.customer')} value={receiver} />
            </Col>
            <Col sm>
              <TextField label={t('invoice.customerIco')} value={customerIco} />
            </Col>
          </Row>
          <Row>
            <Col sm>
              <TextField
                label={t('invoice.uploadedAt')}
                value={formatDate(parseISO(createdAt), 'yyyy-MM-dd HH:mm')}
              />
            </Col>
            <Col sm>
              <TextField label={t('invoice.issueDate')} value={issueDate} />
            </Col>
            <Col sm>
              <TextField label={t('invoice.format')} value={format} />
            </Col>
          </Row>
          <Row>
            <Col sm>
              <TextField label={t('invoice.amount')} value={`${amount} ${amountCurrency}`} />
            </Col>
            <Col sm>
              <TextField label={t('invoice.amountWithoutVat')} value={`${amountWithoutVat} ${amountWithoutVatCurrency}`} />
            </Col>
          </Row>
          <Row>
            <Col sm>
              <CheckboxField label="Test" value={test} />
            </Col>
            <Col sm>
              <CheckboxField label={t('invoice.notificationsSent')} value={notificationsStatus === notificationStates.SENT} />
            </Col>
          </Row>
        </div>
        <Row className="justify-content-center">
          <Button variant="primary" href={`${CONFIG.apiServerUrl}/invoices/${id}/detail`}>
            {`${t('download')} XML`}
          </Button>
          <Button variant="success" href={`${CONFIG.apiServerUrl}/invoices/${id}/visualization`}>
            {`${t('download')} ZIP`}
          </Button>
        </Row>
      </Card.Body>
    </Card>
  )
}
