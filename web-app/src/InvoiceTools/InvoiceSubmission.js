import {useCallback} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import save from 'save-file'
import {Button, Checkboxes, Label} from '../helpers/idsk'
import ConfirmationButton from '../helpers/ConfirmationButton'
import FileUploader from '../helpers/FileUploader'
import {
  createInvoice, setInvoiceSubmissionData, setInvoiceSubmissionTest,
  resetInvoiceSubmission, getInvoiceVisualization,
} from './actions'
import {submissionInvoiceSelector, submissionTestSelector} from './state'

export default ({showSubmission, title}) => {
  const {t} = useTranslation('common')
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
      const {invoiceId, redirect} = await dispatch(createInvoice(data, test))
      if (invoiceId) {
        dispatch(resetInvoiceSubmission)
        if (redirect) {
          history.push(`/invoices/${invoiceId}`)
        }
      }
    },
    [dispatch, history, invoice, test]
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
    <>
      <h1 className="govuk-heading-l">{t(title)}</h1>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Label>{t('invoiceTypes.invoice')}</Label>
          <div>
            <FileUploader
              fileName={invoice?.name}
              accept=".xml"
              buttonText={t('upload')}
              uploadFile={updateInvoiceData}
              deleteFile={clearInvoiceData}
            />
          </div>
        </div>
        {showSubmission && <div className="govuk-grid-column-one-half">
          <Checkboxes
            className="govuk-checkboxes--small"
            fieldset={{legend: {children: 'Test'}}}
            items={[{
              checked: test,
              children: 'Test',
              onChange: toggleTest,
            }]}
          />
        </div>}
      </div>
      <div className="govuk-button-group">
        <Button
          className="govuk-button--secondary"
          onClick={getRawInvoice}
          disabled={!invoice}
        >
          {t('download')} XML
        </Button>
        <Button
          className="govuk-button--secondary"
          onClick={visualizeInvoice}
          disabled={!invoice}
        >
          {t('downloadVisualization')}
        </Button>
        {showSubmission && <ConfirmationButton
          onClick={submitInvoice}
          confirmationTitle={t('confirmationQuestions.submitInvoice.title')}
          confirmationText={t('confirmationQuestions.submitInvoice.text')}
          disabled={!invoice}
        >
          {t('submit')}
        </ConfirmationButton>}
      </div>
    </>
  )
}
