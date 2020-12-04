import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {useHistory, useParams} from 'react-router-dom'
import {branch, lifecycle, renderComponent, renderNothing} from 'recompose'
import {Button, Card} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'
import {get} from 'lodash'
import NotFound from './helpers/NotFound'
import {getInvoiceDetail, getInvoiceMeta} from '../actions/invoices'
import {invoiceDownloadUrl} from '../utils/constants'

const InvoiceView = ({invoice}) => {
  const {id} = useParams()
  const {t} = useTranslation('common')
  const history = useHistory()
  return (
    <Card style={{margin: '5px'}}>
      <Card.Header className="bg-primary text-white text-center" as="h3" style={{display: 'grid'}}>
        <div style={{gridRowStart: 1, gridColumnStart: 1, justifySelf: 'center'}}>{t('invoice')} {id}</div>
        <div style={{gridRowStart: 1, gridColumnStart: 1, justifySelf: 'right'}}>
          <Button variant="danger" onClick={history.goBack}>{t('close')}</Button>
        </div>
      </Card.Header>
      <Card.Body>
        <div className="row justify-content-center">
          <textarea
            style={{borderStyle: 'solid'}}
            rows="20"
            cols="100"
            readOnly
            value={invoice}
          />
        </div>
        <div className="row justify-content-center">
          <a href={invoiceDownloadUrl(id)}>
            <Button variant="success">{t('download')}</Button>
          </a>
        </div>
      </Card.Body>
    </Card>
  )
}

export default compose(
  connect(
    (state, {match: {params: {id}}}) => ({
      invoice: get(state, ['invoices', id, 'data']),
      invoiceDoesNotExist: get(state, ['invoices', id, 'notFound']),
    }),
    {getInvoiceDetail, getInvoiceMeta}
  ),
  lifecycle({
    componentDidMount() {
      this.props.getInvoiceDetail(this.props.match.params.id)
      this.props.getInvoiceMeta(this.props.match.params.id)
    },
  }),
  branch(
    ({invoice}) => invoice == null,
    renderNothing,
  ),
  branch(
    ({invoiceDoesNotExist}) => invoiceDoesNotExist,
    renderComponent(NotFound),
  ),
)(InvoiceView)
