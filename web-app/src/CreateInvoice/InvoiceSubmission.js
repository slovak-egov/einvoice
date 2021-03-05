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
  resetInvoiceSubmission, getInvoiceVisualization, setPartiesType, setInvoiceSubmissionDocumentType,
} from './actions'
import {
  partiesTypeSelector, submissionFormatSelector, submissionInvoiceSelector,
  submissionTestSelector, documentTypeSelector,
} from './state'
import {invoiceFormats, invoiceTypes, partiesTypes} from '../utils/constants'

export default ({showSubmission, title}) => {
  const {i18n, t} = useTranslation('common')
  const history = useHistory()

  const format = useSelector(submissionFormatSelector)
  const invoice = useSelector(submissionInvoiceSelector)
  const test = useSelector(submissionTestSelector)
  const partiesType = useSelector(partiesTypeSelector)
  const documentType = useSelector(documentTypeSelector)

  const dispatch = useDispatch()
  const toggleTest = useCallback(() => dispatch(setInvoiceSubmissionTest(!test)), [dispatch, test])
  const updatePartiesType = useCallback(
    (e) => dispatch(setPartiesType(e.target.value)), [dispatch]
  )
  const clearInvoiceData = useCallback(() => dispatch(setInvoiceSubmissionData(null)), [dispatch])
  const updateInvoiceData = useCallback(
    (e) => dispatch(setInvoiceSubmissionData(e.target.files[0])), [dispatch]
  )
  const updateFormat = useCallback(
    (e) => dispatch(setInvoiceSubmissionFormat(e.target.value)), [dispatch]
  )
  const updateDocumentType = useCallback(
    (e) => dispatch(setInvoiceSubmissionDocumentType(e.target.value)), [dispatch]
  )
  const submitInvoice = useCallback(
    async () => {
      const formData = new FormData()
      formData.append('format', format)
      formData.append('invoice', invoice)
      formData.append('test', test)
      formData.append('partiesType', partiesType)
      formData.append('lang', i18n.language)
      if (format === invoiceFormats.UBL) {
        formData.append('documentType', documentType)
      }

      const {invoiceId, redirect} = await dispatch(createInvoice(formData))
      if (invoiceId) {
        dispatch(resetInvoiceSubmission)
        if (redirect) {
          history.push(`/invoices/${invoiceId}`)
        }
      }
    },
    [dispatch, history, format, invoice, test, partiesType, i18n.language, documentType]
  )

  const visualizeInvoice = useCallback(
    async () => {
      const formData = new FormData()
      formData.append('format', format)
      formData.append('invoice', invoice)
      formData.append('lang', i18n.language)
      if (format === invoiceFormats.UBL) {
        formData.append('documentType', documentType)
      }

      const visualization = await dispatch(getInvoiceVisualization(formData))
      if (visualization) {
        await save(visualization, 'invoice.zip')
      }
    },
    [dispatch, format, invoice, documentType]
  )

  const getRawInvoice = useCallback(
    () => save(invoice, 'invoice.xml'),
    [invoice]
  )

  return (
    <Card className="m-1">
      <Card.Header className="bg-primary text-white text-center" as="h3">
        {t(title)}
      </Card.Header>
      <Card.Body as={Form}>
        <Row>
          <Col md={4} sm={6} xs={6}>
            <Form.Group>
              <Form.Label>{t('invoiceTypes.invoice')}</Form.Label>
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
          <Col md={3} sm={6} xs={6}>
            <Form.Group>
              <Form.Label>{t('invoice.format')}</Form.Label>
              <Form.Control
                as="select"
                className="w-auto"
                value={format}
                onChange={updateFormat}
              >
                <option value={invoiceFormats.UBL}>UBL2.1</option>
                <option value={invoiceFormats.D16B}>D16B</option>
              </Form.Control>
            </Form.Group>
            {format === invoiceFormats.UBL &&
            <Form.Group>
              <Form.Label>{t('invoice.type')}</Form.Label>
              <Form.Control
                as="select"
                className="w-auto"
                value={documentType}
                onChange={updateDocumentType}
              >
                {Object.values(invoiceTypes).map((type) => (
                  <option key={type} value={type}>{t(`invoiceTypes.${type}`)}</option>
                ))}
              </Form.Control>
            </Form.Group>
            }
          </Col>
          {showSubmission && <>
            <Col md={4} sm={6} xs={6}>
              <Form.Group>
                <Form.Label>{t('partiesTypes.name')}</Form.Label>
                <Form.Control
                  as="select"
                  className="w-auto"
                  value={partiesType}
                  onChange={updatePartiesType}
                >
                  {Object.values(partiesTypes).map((type) => (
                    <option key={type} value={type}>{t(`partiesTypes.${type}`)}</option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
            <Col md={1} sm={6} xs={6}>
              <Form.Group>
                <Form.Label>Test</Form.Label>
                <FormCheck
                  type="checkbox"
                  checked={test}
                  onChange={toggleTest}
                />
              </Form.Group>
            </Col>
          </>}
        </Row>
        <Row className="justify-content-end flex-column flex-sm-row">
          <Button
            className="my-1"
            variant="secondary"
            onClick={getRawInvoice}
            disabled={!invoice}
          >
            {t('download')} XML
          </Button>
          <Button
            className="my-1"
            variant="primary"
            onClick={visualizeInvoice}
            disabled={!invoice}
          >
            {t('downloadVisualization')}
          </Button>
          {showSubmission && <ConfirmationButton
            className="my-1"
            variant="success"
            onClick={submitInvoice}
            confirmationTitle={t('confirmationQuestions.submitInvoice.title')}
            confirmationText={t('confirmationQuestions.submitInvoice.text')}
            disabled={!invoice}
          >
            {t('submit')}
          </ConfirmationButton>}
        </Row>
      </Card.Body>
    </Card>
  )
}
