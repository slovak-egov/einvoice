import {forwardReducerTo} from './utils/helpers'
import {invoiceFormats} from './utils/constants'

const getInitialState = () => ({
  invoices: {},
  users: {},
  accountScreen: {
    newSubstituteId: '',
  },
  // Count of running requests
  // If there is at least one running request show Loading Modal
  loadingRequests: 0,
  createInvoiceScreen: {
    format: invoiceFormats.UBL,
    test: false,
  },
  publicInvoicesScreen: {
    filters: {
      formats: {
        [invoiceFormats.UBL]: true,
        [invoiceFormats.D16B]: true,
      },
      test: false,
    },
  },
  myInvoicesScreen: {
    filters: {
      formats: {
        [invoiceFormats.UBL]: true,
        [invoiceFormats.D16B]: true,
      },
      test: false,
      received: true,
      supplied: true,
    },
  },
  logging: true, // Always start with login attempt
  loggedUserId: null,
})

const rootReducer = (state = getInitialState(), action) => {
  if (action.reducer) {
    return forwardReducerTo(action.reducer, action.path)(state, action.payload)
  }

  return state
}

export default rootReducer
