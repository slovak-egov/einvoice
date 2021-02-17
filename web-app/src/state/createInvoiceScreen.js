const invoiceSubmissionScreenSelector = (state) => state.createInvoiceScreen.submission

export const submissionFormatSelector = (state) => invoiceSubmissionScreenSelector(state).format

export const submissionInvoiceSelector = (state) => invoiceSubmissionScreenSelector(state).invoice

export const submissionTestSelector = (state) => invoiceSubmissionScreenSelector(state).test

export const foreignSupplierSelector = (state) =>
  invoiceSubmissionScreenSelector(state).foreignSupplier
