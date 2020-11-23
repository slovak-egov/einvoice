import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {Button, Card, Col, Form, InputGroup, Row} from 'react-bootstrap'
import {withHandlers} from 'recompose'
import {withTranslation} from 'react-i18next'
import ConfirmationButton from './helpers/ConfirmationButton'
import FileUploader from './helpers/FileUploader'
import Auth from './helpers/Auth'
import {createInvoice, setCreateInvoiceData, setCreateInvoiceFormat} from '../actions/invoices'
import {invoiceFormats} from '../utils/constants'

const CreateInvoice = ({clearInvoiceData, format, invoice, submitInvoice, t, updateFormat, updateInvoiceData}) => (
  <Card style={{margin: '5px'}}>
    <Card.Header className="bg-primary text-white text-center" as="h3">
      {t('TopBar:tabs.createInvoice')}
    </Card.Header>
    <Card.Body>
      <Form>
        <Row>
          <Col>
            <Form.Group>
              <Form.Label>{t('invoice')}</Form.Label>
              <div>
                {invoice ? <InputGroup>
                  <Form.Control
                    value={invoice.name}
                    readOnly
                    style={{maxWidth: '200px'}}
                  />
                  <InputGroup.Append>
                    <Button variant="danger" onClick={clearInvoiceData} style={{margin: 0}}>X</Button>
                  </InputGroup.Append>
                </InputGroup> :
                <FileUploader
                  accept=".xml"
                  buttonStyle={{margin: 0}}
                  buttonText={t('uploadInvoice')}
                  onChange={updateInvoiceData}
                />}
              </div>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group>
              <Form.Label>{t('format')}</Form.Label>
              <Form.Control
                as="select"
                value={format}
                onChange={updateFormat}
                style={{width: '100px'}}
              >
                <option value={invoiceFormats.UBL}>UBL2.1</option>
                <option value={invoiceFormats.D16B}>D16B</option>
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>
        <Row className="justify-content-center">
          <ConfirmationButton
            onClick={submitInvoice}
            confirmationTitle={t('TopBar:tabs.createInvoice')}
            confirmationText={t('invoices:confirmationQuestion')}
            disabled={!invoice}
          >
            {t('submit')}
          </ConfirmationButton>
        </Row>
      </Form>
    </Card.Body>
  </Card>
)

export default Auth(
  compose(
    connect(
      (state) => {
        return {
          format: state.createInvoiceScreen.format,
          invoice: state.createInvoiceScreen.invoice,
        }
      },
      {createInvoice, setCreateInvoiceData, setCreateInvoiceFormat}
    ),
    withHandlers({
      submitInvoice: ({createInvoice, format, history, invoice, setCreateInvoiceData, setCreateInvoiceFormat}) =>
        async () => {
          const formData = new FormData()
          formData.append('format', format)
          formData.append('invoice', invoice)

          const {invoiceId, redirect} = await createInvoice(formData)
          if (invoiceId) {
            setCreateInvoiceFormat(invoiceFormats.UBL)
            setCreateInvoiceData(null)
            if (redirect) {
              history.push(`/invoices/${invoiceId}`)
            }
          }
        },
      updateFormat: ({setCreateInvoiceFormat}) => (e) => setCreateInvoiceFormat(e.target.value),
      updateInvoiceData: ({setCreateInvoiceData}) => (e) => setCreateInvoiceData(e.target.files[0]),
      clearInvoiceData: ({setCreateInvoiceData}) => () => setCreateInvoiceData(null),
    }),
    withTranslation(['common', 'TopBar', 'invoices']),
  )(CreateInvoice)
)
