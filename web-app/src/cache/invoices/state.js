import {get} from 'lodash'

export const invoicesSelector = (state) => state.invoices

export const getInvoiceSelector = (id) => (state) => get(invoicesSelector(state), id)
