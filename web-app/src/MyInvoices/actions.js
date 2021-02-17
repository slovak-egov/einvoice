import {getInvoices} from '../cache/invoices/actions'

export const getMyInvoices = getInvoices({
  path: ['myInvoicesScreen'],
  fetchInvoices: (api) => api.users.getMyInvoices,
})
