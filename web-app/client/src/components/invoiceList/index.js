import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {branch, lifecycle, renderNothing} from 'recompose'
import {NavLink} from 'react-router-dom'
import {Card, Table} from 'react-bootstrap'
import {withTranslation} from 'react-i18next'
import Filters from './Filters'
import {get} from 'lodash'

const InvoiceList = ({
  areCustomFilterFieldsValid, CustomFilter, getInvoices, invoices, invoiceIds, path, t, title,
}) => (
  <Card style={{margin: '5px'}}>
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
            <th>{t('invoices:sender')}</th>
            <th>{t('invoices:receiver')}</th>
            <th>{t('invoices:issueDate')}</th>
            <th>{t('invoices:price')}</th>
            <th>{t('format')}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {invoiceIds.map((invoiceId, i) => (
            <tr key={i}>
              <td>{invoiceId}</td>
              <td>{invoices[invoiceId].sender}</td>
              <td>{invoices[invoiceId].receiver}</td>
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
    </Card.Body>
  </Card>
)

export default compose(
  connect(
    (state, {path}) => ({
      invoices: state.invoices,
      invoiceIds: get(state, [...path, 'ids']),
    }),
  ),
  lifecycle({
    componentDidMount() {
      this.props.getInvoices()
    },
  }),
  branch(
    ({invoiceIds}) => invoiceIds == null,
    renderNothing,
  ),
  withTranslation(['common', 'invoices']),
)(InvoiceList)
