import {useCallback} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Link, useLocation} from 'react-router-dom'
import {Card, Table} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'
import classnames from 'classnames'
import {get} from 'lodash'
import Filters from './Filters'
import {invoicesSelector} from '../../state/invoices'

export default ({
  areCustomFilterFieldsValid, CustomFilter, defaultExtraQuery, getInvoicesAction, path, title,
}) => {
  const {t} = useTranslation(['common', 'invoices'])
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
        <Filters
          getInvoices={getInvoices}
          CustomFilter={CustomFilter}
          areCustomFilterFieldsValid={areCustomFilterFieldsValid}
          defaultExtraQuery={defaultExtraQuery}
        />
        {invoiceIds && <>
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
                <tr key={i} className={classnames({'text-secondary': invoices[invoiceId].test})}>
                  <td>{invoiceId}</td>
                  <td>{invoices[invoiceId].supplierIco}</td>
                  <td>{invoices[invoiceId].customerIco}</td>
                  <td>{invoices[invoiceId].issueDate}</td>
                  <td>{invoices[invoiceId].price}</td>
                  <td>{invoices[invoiceId].format}</td>
                  <td>
                    <Link to={`/invoices/${invoiceId}`}>detail</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {nextId && <div
            className="text-primary d-flex border border-primary rounded-lg"
            style={{cursor: 'pointer'}}
            onClick={() => getInvoices(search, nextId)}
          >
            <div className="m-auto">
              {t('loadMore')}
            </div>
          </div>}
        </>}
      </Card.Body>
    </Card>
  )
}
