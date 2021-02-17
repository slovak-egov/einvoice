import {getInvoices} from '../cache/invoices/actions'

export const getPublicInvoices = getInvoices({
  path: ['publicInvoicesScreen'],
  fetchInvoices: (api) => api.invoices.getPublic,
})
