import {useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Form} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'
import {format as formatDate, parseISO} from 'date-fns'
import {Button} from '../helpers/idsk'
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
    <>
      <div className="govuk-back-link" onClick={history.goBack} style={{cursor: 'pointer'}}>
        {t('back')}
      </div>
      <h1 className="govuk-heading-l">{t('invoiceTypes.invoice')}</h1>
      <div>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <TextField label="ID" value={id} />
          </div>
        </div>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-half">
            <TextField label={t('invoice.supplier')} value={sender} />
          </div>
          <div className="govuk-grid-column-one-half">
            <TextField label={t('invoice.supplierIco')} value={supplierIco} />
          </div>
        </div>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-half">
            <TextField label={t('invoice.customer')} value={receiver} />
          </div>
          <div className="govuk-grid-column-one-half">
            <TextField label={t('invoice.customerIco')} value={customerIco} />
          </div>
        </div>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-third">
            <TextField
              label={t('invoice.uploadedAt')}
              value={formatDate(parseISO(createdAt), 'yyyy-MM-dd HH:mm')}
            />
          </div>
          <div className="govuk-grid-column-one-third">
            <TextField label={t('invoice.issueDate')} value={issueDate} />
          </div>
          <div className="govuk-grid-column-one-third">
            <TextField label={t('invoice.format')} value={format} />
          </div>
        </div>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-half">
            <TextField label={t('invoice.amount')} value={`${amount} ${amountCurrency}`} />
          </div>
          <div className="govuk-grid-column-one-half">
            <TextField label={t('invoice.amountWithoutVat')} value={`${amountWithoutVat} ${amountWithoutVatCurrency}`} />
          </div>
        </div>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-half">
            <CheckboxField label="Test" value={test} />
          </div>
          <div className="govuk-grid-column-one-half">
            <CheckboxField label={t('invoice.notificationsSent')} value={notificationsStatus === notificationStates.SENT} />
          </div>
        </div>
      </div>
      <div className="govuk-button-group" style={{justifyContent: 'center'}}>
        <Button className="govuk-button--secondary" href={`${CONFIG.apiServerUrl}/invoices/${id}/detail`}>
          {`${t('download')} XML`}
        </Button>
        <Button href={`${CONFIG.apiServerUrl}/invoices/${id}/visualization`}>
          {`${t('download')} ZIP`}
        </Button>
      </div>
    </>
  )
}
