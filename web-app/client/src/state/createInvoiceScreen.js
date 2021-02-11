const invoiceSubmissionScreenSelector = (state) => state.createInvoiceScreen.submission
const invoiceVisualizationScreenSelector = (state) => state.createInvoiceScreen.visualization

export const submissionFormatSelector = (state) => invoiceSubmissionScreenSelector(state).format

export const submissionInvoiceSelector = (state) => invoiceSubmissionScreenSelector(state).invoice

export const submissionTestSelector = (state) => invoiceSubmissionScreenSelector(state).test

export const visualizationFormatSelector = (state) => invoiceVisualizationScreenSelector(state).format

export const visualizationInvoiceSelector = (state) => invoiceVisualizationScreenSelector(state).invoice
