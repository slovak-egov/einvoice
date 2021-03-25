import {useCallback} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Link, useLocation} from 'react-router-dom'
import {Button, Card, Table} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'
import classnames from 'classnames'
import {get} from 'lodash'
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
    <Card className="m-1">
      <Card.Header className="bg-primary text-white text-center" as="h3">{title}</Card.Header>
      <Card.Body>
        <Filters getInvoices={getInvoices} />
        {invoiceIds && <>
          <Table striped hover responsive size="sm">
            <thead>
              <tr>
                <th>#</th>
                <th>{t('invoice.supplierIco')}</th>
                <th>{t('invoice.customerIco')}</th>
                <th>{t('invoice.issueDate')}</th>
                <th>{t('invoice.amount')}</th>
                <th>{t('invoice.format')}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {invoiceIds.map((invoiceId, i) => (
                <tr key={i} className={classnames({'text-secondary': invoices[invoiceId].test})}>
                  <td>{i + 1}</td>
                  <td>{invoices[invoiceId].supplierIco}</td>
                  <td>{invoices[invoiceId].customerIco}</td>
                  <td>{invoices[invoiceId].issueDate}</td>
                  <td>{invoices[invoiceId].amount}</td>
                  <td>{invoices[invoiceId].format}</td>
                  <td>
                    <Link to={`/invoices/${invoiceId}`}>detail</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {nextId &&
            <Button variant="outline-primary" block onClick={() => getInvoices(search, nextId)}>
              {t('loadMore')}
            </Button>}
        </>}
      </Card.Body>
    </Card>
  )
}
