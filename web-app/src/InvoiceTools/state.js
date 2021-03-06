import {get} from 'lodash'

export const INVOICE_SUBMISSION_PATH = ['createInvoiceScreen', 'submission']

const invoiceSubmissionSelector = (state) => get(state, INVOICE_SUBMISSION_PATH)

export const submissionInvoiceSelector = (state) => invoiceSubmissionSelector(state).invoice

export const submissionTestSelector = (state) => invoiceSubmissionSelector(state).test
