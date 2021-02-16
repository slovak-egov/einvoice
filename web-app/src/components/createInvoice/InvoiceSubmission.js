import {useCallback} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'
import {Button, Card, Col, Form, FormCheck, Row} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'
import save from 'save-file'
import ConfirmationButton from '../helpers/ConfirmationButton'
import FileUploader from '../helpers/FileUploader'
import {
  createInvoice, setInvoiceSubmissionData, setInvoiceSubmissionFormat, setInvoiceSubmissionTest,
  resetInvoiceSubmission, getInvoiceVisualization,
} from '../../actions/createInvoiceScreen'
import {
  submissionFormatSelector, submissionInvoiceSelector, submissionTestSelector,
} from '../../state/createInvoiceScreen'
import {invoiceFormats} from '../../utils/constants'

export default ({showSubmission}) => {
  const {t} = useTranslation(['common', 'invoices'])
  const history = useHistory()

  const format = useSelector(submissionFormatSelector)
  const invoice = useSelector(submissionInvoiceSelector)
  const test = useSelector(submissionTestSelector)

  const dispatch = useDispatch()
  const toggleTest = useCallback(() => dispatch(setInvoiceSubmissionTest(!test)), [dispatch, test])
  const clearInvoiceData = useCallback(() => dispatch(setInvoiceSubmissionData(null)), [dispatch])
  const updateInvoiceData = useCallback(
    (e) => dispatch(setInvoiceSubmissionData(e.target.files[0])), [dispatch]
  )
  const updateFormat = useCallback(
    (e) => dispatch(setInvoiceSubmissionFormat(e.target.value)), [dispatch]
  )
  const submitInvoice = useCallback(
    async () => {
      const formData = new FormData()
      formData.append('format', format)
      formData.append('invoice', invoice)
      formData.append('test', test)

      const {invoiceId, redirect} = await dispatch(createInvoice(formData))
      if (invoiceId) {
        dispatch(resetInvoiceSubmission())
        if (redirect) {
          history.push(`/invoices/${invoiceId}`)
        }
      }
    },
    [dispatch, history, format, invoice, test]
  )

  const visualizeInvoice = useCallback(
    async () => {
      const formData = new FormData()
      formData.append('format', format)
      formData.append('invoice', invoice)

      const visualization = await dispatch(getInvoiceVisualization(formData))
      if (visualization) {
        await save(visualization, 'invoice.zip')
      }
    },
    [dispatch, format, invoice]
  )

  const getRawInvoice = useCallback(
    () => save(invoice, 'invoice.xml'),
    [invoice]
  )

  return (
    <Card className="m-1">
      <Card.Header className="bg-primary text-white text-center" as="h3">
        {t('submission')}
      </Card.Header>
      <Card.Body as={Form}>
        <Row>
          <Col>
            <Form.Group>
              <Form.Label>{t('invoice')}</Form.Label>
              <div>
                <FileUploader
                  file={invoice}
                  accept=".xml"
                  buttonStyle={{margin: 0}}
                  buttonText={t('upload')}
                  uploadFile={updateInvoiceData}
                  deleteFile={clearInvoiceData}
                />
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
          {showSubmission && <Col>
            <Form.Group>
              <Form.Label>Test</Form.Label>
              <FormCheck
                type="checkbox"
                checked={test}
                onChange={toggleTest}
              />
            </Form.Group>
          </Col>}
        </Row>
        <Row className="justify-content-end">
          <Button
            variant="secondary"
            onClick={getRawInvoice}
            disabled={!invoice}
          >
            {t('download')} XML
          </Button>
          <Button
            variant="primary"
            onClick={visualizeInvoice}
            disabled={!invoice}
          >
            {t('downloadVisualization')}
          </Button>
          {showSubmission && <ConfirmationButton
            variant="success"
            onClick={submitInvoice}
            confirmationTitle={t('topBar.createInvoice')}
            confirmationText={t('invoices:confirmationQuestion')}
            disabled={!invoice}
          >
            {t('submit')}
          </ConfirmationButton>}
        </Row>
      </Card.Body>
    </Card>
  )
}
