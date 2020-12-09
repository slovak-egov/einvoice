import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {useHistory, useParams} from 'react-router-dom'
import {branch, lifecycle, renderComponent, renderNothing} from 'recompose'
import {Button, Card, Col, Form, Row} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'
import {get} from 'lodash'
import NotFound from './helpers/NotFound'
import BoolIcon from './helpers/BoolIcon'
import {getInvoiceDetail, getInvoiceMeta} from '../actions/invoices'
import {invoiceDownloadUrl} from '../utils/constants'

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

const InvoiceView = ({
  createdAt, customerIco, format, isPublic, issueDate, price, receiver, sender, supplierIco, test,
  xml,
}) => {
  const {id} = useParams()
  const {t} = useTranslation(['common', 'invoices'])
  const history = useHistory()
  return (
    <Card className="m-1">
      <Card.Header className="bg-primary text-white text-center" as="h3" style={{display: 'grid'}}>
        <div style={{gridRowStart: 1, gridColumnStart: 1, justifySelf: 'center'}}>{t('invoice')} {id}</div>
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
              <TextField label={t('invoices:createdAt')} value={createdAt} />
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
          </Row>
          <Row className="justify-content-center">
            <Form.Group>
              <Form.Label>XML</Form.Label>
              <Form.Control
                as="textarea"
                rows="20"
                cols="100"
                value={xml}
                readOnly
              />
            </Form.Group>
          </Row>
        </div>
        <Row className="justify-content-center">
          <a href={invoiceDownloadUrl(id)}>
            <Button variant="success">{t('download')}</Button>
          </a>
        </Row>
      </Card.Body>
    </Card>
  )
}

export default compose(
  connect(
    (state, {match: {params: {id}}}) => ({
      ...get(state, ['invoices', id]),
      invoiceDoesNotExist: get(state, ['invoices', id, 'notFound']),
    }),
    {getInvoiceDetail, getInvoiceMeta}
  ),
  lifecycle({
    componentDidMount() {
      this.props.getInvoiceDetail(this.props.match.params.id)
      this.props.getInvoiceMeta(this.props.match.params.id)
    },
  }),
  branch(
    // Metadata and XML are fetched from different endpoints, so we need to check
    // if both of them are already fetched
    ({id, xml}) => id == null || xml == null,
    renderNothing,
  ),
  branch(
    ({invoiceDoesNotExist}) => invoiceDoesNotExist,
    renderComponent(NotFound),
  ),
)(InvoiceView)
