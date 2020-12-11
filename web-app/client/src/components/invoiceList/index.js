import React, {useEffect} from 'react'
import {useSelector} from 'react-redux'
import {NavLink} from 'react-router-dom'
import {Card, Table} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'
import {get} from 'lodash'
import Filters from './Filters'
import {invoicesSelector} from '../../state/invoices'

const getRowClassNames = (invoice) => invoice.test ? 'text-secondary' : ''

export default ({areCustomFilterFieldsValid, CustomFilter, getInvoices, path, title}) => {
  const {t} = useTranslation(['common', 'invoices'])

  useEffect(() => {
    getInvoices()
  }, [getInvoices])

  const invoices = useSelector(invoicesSelector)
  const invoiceIds = useSelector((state) => get(state, [...path, 'ids']))
  const nextId = useSelector((state) => get(state, [...path, 'nextId']))

  if (invoiceIds == null) return null

  return (
    <Card className="m-1">
      <Card.Header className="bg-primary text-white text-center" as="h3">{title}</Card.Header>
      <Card.Body>
        <Filters
          getInvoices={getInvoices}
          path={[...path, 'filters']}
          CustomFilter={CustomFilter}
          areCustomFilterFieldsValid={areCustomFilterFieldsValid}
        />
        <Table striped hover responsive size="sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>{t('invoices:supplierIco')}</th>
              <th>{t('invoices:customerIco')}</th>
              <th>{t('invoices:issueDate')}</th>
              <th>{t('invoices:price')}</th>
              <th>{t('format')}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {invoiceIds.map((invoiceId, i) => (
              <tr key={i} className={getRowClassNames(invoices[invoiceId])}>
                <td>{invoiceId}</td>
                <td>{invoices[invoiceId].supplierIco}</td>
                <td>{invoices[invoiceId].customerIco}</td>
                <td>{invoices[invoiceId].issueDate}</td>
                <td>{invoices[invoiceId].price}</td>
                <td>{invoices[invoiceId].format}</td>
                <td>
                  <NavLink to={`/invoices/${invoiceId}`}>detail</NavLink>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        {nextId && <div
          className="text-primary d-flex border border-primary rounded-lg"
          style={{cursor: 'pointer'}}
          onClick={() => getInvoices(nextId)}
        >
          <div className="m-auto">
            {t('loadMore')}
          </div>
        </div>}
      </Card.Body>
    </Card>
  )
}
