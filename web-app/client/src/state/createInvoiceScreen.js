const createInvoiceScreenSelector = (state) => state.createInvoiceScreen

export const formatSelector = (state) => createInvoiceScreenSelector(state).format

export const invoiceSelector = (state) => createInvoiceScreenSelector(state).invoice

export const isTestSelector = (state) => createInvoiceScreenSelector(state).test
