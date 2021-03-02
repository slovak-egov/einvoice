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
    createdAt, customerIco, format, issueDate, notificationsStatus, price, receiver, sender,
    supplierIco, test,
  } = invoice

  return (
    <Card className="m-1">
      <Card.Header className="bg-primary text-white text-center" as="h3" style={{display: 'grid'}}>
        <div style={{gridRowStart: 1, gridColumnStart: 1, justifySelf: 'center'}}>
          {t('invoice.title')} {id}
        </div>
        <div style={{gridRowStart: 1, gridColumnStart: 1, justifySelf: 'right'}}>
          <Button variant="danger" onClick={history.goBack}>{t('close')}</Button>
        </div>
      </Card.Header>
      <Card.Body>
        <div>
          <Row>
            <Col>
              <TextField label={t('invoice.sender')} value={sender} />
            </Col>
            <Col>
              <TextField label={t('invoice.supplierIco')} value={supplierIco} />
            </Col>
          </Row>
          <Row>
            <Col>
              <TextField label={t('invoice.receiver')} value={receiver} />
            </Col>
            <Col>
              <TextField label={t('invoice.customerIco')} value={customerIco} />
            </Col>
          </Row>
          <Row>
            <Col>
              <TextField
                label={t('invoice.createdAt')}
                value={formatDate(parseISO(createdAt), 'yyyy-MM-dd HH:mm')}
              />
            </Col>
            <Col>
              <TextField label={t('invoice.issueDate')} value={issueDate} />
            </Col>
            <Col>
              <TextField label={t('invoice.format')} value={format} />
            </Col>
          </Row>
          <Row>
            <Col>
              <TextField label={t('invoice.price')} value={price} />
            </Col>
            <Col>
              <CheckboxField label="Test" value={test} />
            </Col>
            <Col>
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
