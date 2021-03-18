import {useCallback} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Link, useLocation} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {get} from 'lodash'
import {Button, Table} from '../helpers/idsk'
import Filters from './Filters'
import {invoicesSelector} from '../cache/invoices/state'

export default ({getInvoicesAction, path, title}) => {
  const {t} = useTranslation('common')
  const {search} = useLocation()

  const invoices = useSelector(invoicesSelector)
  const invoiceIds = useSelector((state) => get(state, [...path, 'ids']))
  const nextId = useSelector((state) => get(state, [...path, 'nextId']))

  const dispatch = useDispatch()
  const getInvoices = useCallback(
    (query, startId) => dispatch(getInvoicesAction(query, startId)), [dispatch]
  )

  return (
    <>
      <h1 className="govuk-heading-l">{title}</h1>
      <Filters getInvoices={getInvoices} />
      {invoiceIds && <>
        <Table
          head={[
            {children: '#'},
            {children: t('invoice.supplierIco')},
            {children: t('invoice.customerIco')},
            {children: t('invoice.issueDate')},
            {children: t('invoice.amount')},
            {children: t('invoice.format')},
            {children: ''},
          ]}
          rows={invoiceIds.map((invoiceId, i) => [
            {children: i + 1},
            {children: invoices[invoiceId].supplierIco},
            {children: invoices[invoiceId].customerIco},
            {children: invoices[invoiceId].issueDate},
            {children: invoices[invoiceId].amount},
            {children: invoices[invoiceId].format},
            {children: <Link to={`/invoices/${invoiceId}`}>detail</Link>},
          ])}
        />
        {nextId && <Button
          style={{width: '100%'}}
          onClick={() => getInvoices(search, nextId)}
        >
          {t('loadMore')}
        </Button>}
      </>}
    </>
  )
}
