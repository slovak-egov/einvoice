import {useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useTranslation} from 'react-i18next'
import {format as formatDate, parseISO} from 'date-fns'
import {Button, Checkboxes, Input} from '../helpers/idsk'
import NotFound from '../helpers/NotFound'
import {getInvoiceSelector} from '../cache/invoices/state'
import {getInvoiceMeta} from '../cache/invoices/actions'
import {notificationStates} from '../utils/constants'
import {CONFIG} from '../appSettings'

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
    <div className="govuk-main-wrapper container">
      <div className="govuk-back-link" onClick={history.goBack} style={{cursor: 'pointer'}}>
        {t('back')}
      </div>
      <h1 className="govuk-heading-l">{t('invoiceTypes.invoice')}</h1>
      <div>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <Input
              label={{children: 'ID'}}
              value={id}
              readOnly
            />
          </div>
        </div>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-half">
            <Input
              label={{children: t('invoice.supplier')}}
              value={sender}
              readOnly
            />
          </div>
          <div className="govuk-grid-column-one-half">
            <Input
              label={{children: t('invoice.supplierIco')}}
              value={supplierIco}
              readOnly
            />
          </div>
        </div>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-half">
            <Input
              label={{children: t('invoice.customer')}}
              value={receiver}
              readOnly
            />
          </div>
          <div className="govuk-grid-column-one-half">
            <Input
              label={{children: t('invoice.customerIco')}}
              value={customerIco}
              readOnly
            />
          </div>
        </div>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-third">
            <Input
              label={{children: t('invoice.uploadedAt')}}
              value={formatDate(parseISO(createdAt), 'yyyy-MM-dd HH:mm')}
              readOnly
            />
          </div>
          <div className="govuk-grid-column-one-third">
            <Input
              label={{children: t('invoice.issueDate')}}
              value={issueDate}
              readOnly
            />
          </div>
          <div className="govuk-grid-column-one-third">
            <Input
              label={{children: t('invoice.format')}}
              value={format}
              readOnly
            />
          </div>
        </div>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-half">
            <Input
              label={{children: t('invoice.amount')}}
              value={`${amount} ${amountCurrency}`}
              readOnly
            />
          </div>
          <div className="govuk-grid-column-one-half">
            <Input
              label={{children: t('invoice.amountWithoutVat')}}
              value={`${amountWithoutVat} ${amountWithoutVatCurrency}`}
              readOnly
            />
          </div>
        </div>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-half">
            <Checkboxes
              className="govuk-checkboxes--small"
              name="detail-test-checkbox"
              items={[{
                checked: test,
                children: 'Test',
              }]}
            />
          </div>
          <div className="govuk-grid-column-one-half">
            <Checkboxes
              className="govuk-checkboxes--small"
              name="detail-notificationStatus-checkbox"
              items={[{
                checked: notificationsStatus === notificationStates.SENT,
                children: t('invoice.notificationsSent'),
              }]}
            />
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
    </div>
  )
}
