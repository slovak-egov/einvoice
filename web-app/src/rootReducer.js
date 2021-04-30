import {forwardReducerTo} from './utils/helpers'
import {invoiceTypes, invoiceComplexities} from './utils/constants'

const getInitialState = () => ({
  invoices: {},
  users: {},
  // Count of running requests
  // If there is at least one running request show Loading Modal
  loadingRequests: 0,
  createInvoiceScreen: {
    submission: {
      test: false,
    },
    form: {
      [invoiceTypes.INVOICE]: {},
      [invoiceTypes.CREDIT_NOTE]: {},
      type: invoiceTypes.INVOICE,
      complexity: invoiceComplexities.SIMPLE,
    },
  },
  publicInvoicesScreen: {},
  myInvoicesScreen: {},
  logging: true, // Always start with login attempt
  loggedUserId: null,
  docs: {
    'ubl2.1': {},
  },
})

const rootReducer = (state = getInitialState(), action) => {
  if (action.reducer) {
    return forwardReducerTo(action.reducer, action.path)(state, action.payload)
  }

  return state
}

export default rootReducer
