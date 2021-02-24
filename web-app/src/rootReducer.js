import {forwardReducerTo} from './utils/helpers'
import {invoiceFormats} from './utils/constants'

const getInitialState = () => ({
  invoices: {},
  users: {},
  // Count of running requests
  // If there is at least one running request show Loading Modal
  loadingRequests: 0,
  createInvoiceScreen: {
    submission: {
      format: invoiceFormats.UBL,
      test: false,
      foreignSupplier: false,
    },
    form: null,
  },
  publicInvoicesScreen: {},
  myInvoicesScreen: {},
  logging: true, // Always start with login attempt
  loggedUserId: null,
  docs: {},
})

const rootReducer = (state = getInitialState(), action) => {
  if (action.reducer) {
    return forwardReducerTo(action.reducer, action.path)(state, action.payload)
  }

  return state
}

export default rootReducer
