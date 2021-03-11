import {useCallback} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'
import {Button, Card, Col, Form, FormCheck, Row} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'
import save from 'save-file'
import ConfirmationButton from '../helpers/ConfirmationButton'
import FileUploader from '../helpers/FileUploader'
import {
  createInvoice, setInvoiceSubmissionData, setInvoiceSubmissionTest,
  resetInvoiceSubmission, getInvoiceVisualization,
} from './actions'
import {submissionInvoiceSelector, submissionTestSelector} from './state'

export default ({showSubmission, title}) => {
  const {i18n, t} = useTranslation('common')
  const history = useHistory()

  const invoice = useSelector(submissionInvoiceSelector)
  const test = useSelector(submissionTestSelector)

  const dispatch = useDispatch()
  const toggleTest = useCallback(() => dispatch(setInvoiceSubmissionTest(!test)), [dispatch, test])

  const clearInvoiceData = useCallback(() => dispatch(setInvoiceSubmissionData(null)), [dispatch])
  const updateInvoiceData = useCallback(
    (e) => dispatch(setInvoiceSubmissionData(e.target.files[0])), [dispatch]
  )

  const submitInvoice = useCallback(
    async () => {
      const data = await invoice.text()
      const {invoiceId, redirect} = await dispatch(createInvoice({data, test}))
      if (invoiceId) {
        dispatch(resetInvoiceSubmission)
        if (redirect) {
          history.push(`/invoices/${invoiceId}`)
        }
      }
    },
    [dispatch, history, invoice, test, i18n.language]
  )

  const visualizeInvoice = useCallback(
    async () => {
      const visualization = await dispatch(getInvoiceVisualization(invoice))
      if (visualization) {
        await save(visualization, 'invoice.zip')
      }
    },
    [dispatch, invoice]
  )

  const getRawInvoice = useCallback(() => save(invoice), [invoice])

  return (
    <Card className="m-1">
      <Card.Header className="bg-primary text-white text-center" as="h3">
        {t(title)}
      </Card.Header>
      <Card.Body as={Form}>
        <Row>
          <Col md={4} sm={6} xs={12}>
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
          {showSubmission && <>
            <Col md={1} sm={6} xs={12}>
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
