import {useCallback} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'
import {Button, Card, Col, Form, FormCheck, InputGroup, Row} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'
import ConfirmationButton from './helpers/ConfirmationButton'
import FileUploader from './helpers/FileUploader'
import {
  createInvoice, setCreateInvoiceData, setCreateInvoiceFormat, setCreateInvoiceTest,
} from '../actions/invoices'
import {formatSelector, invoiceSelector, isTestSelector} from '../state/createInvoiceScreen'
import {invoiceFormats} from '../utils/constants'

export default () => {
  const {t} = useTranslation(['common', 'TopBar', 'invoices'])
  const history = useHistory()

  const format = useSelector(formatSelector)
  const invoice = useSelector(invoiceSelector)
  const test = useSelector(isTestSelector)

  const dispatch = useDispatch()
  const toggleTest = useCallback(() => dispatch(setCreateInvoiceTest(!test)), [dispatch, test])
  const clearInvoiceData = useCallback(() => dispatch(setCreateInvoiceData(null)), [dispatch])
  const updateInvoiceData = useCallback(
    (e) => dispatch(setCreateInvoiceData(e.target.files[0])), [dispatch]
  )
  const updateFormat = useCallback(
    (e) => dispatch(setCreateInvoiceFormat(e.target.value)), [dispatch]
  )
  const submitInvoice = useCallback(
    async () => {
      const formData = new FormData()
      formData.append('format', format)
      formData.append('invoice', invoice)
      formData.append('test', test)

      const {invoiceId, redirect} = await dispatch(createInvoice(formData))
      if (invoiceId) {
        dispatch(setCreateInvoiceFormat(invoiceFormats.UBL))
        dispatch(setCreateInvoiceData(null))
        dispatch(setCreateInvoiceTest(false))
        if (redirect) {
          history.push(`/invoices/${invoiceId}`)
        }
      }
    },
    [dispatch, history, format, invoice, test]
  )

  return (
    <Card className="m-1">
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
                  {invoice ?
                    <InputGroup>
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
            <Col>
              <Form.Group>
                <Form.Label>Test</Form.Label>
                <FormCheck
                  type="checkbox"
                  checked={test}
                  onChange={toggleTest}
                />
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
}
