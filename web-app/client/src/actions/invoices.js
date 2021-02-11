import swal from 'sweetalert'
import {loadingWrapper, setData} from './common'

export const setCreateInvoiceFormat = setData(['createInvoiceScreen', 'format'])
export const setCreateInvoiceData = setData(['createInvoiceScreen', 'invoice'])
export const setCreateInvoiceTest = setData(['createInvoiceScreen', 'test'])

const setInvoiceIds = (path, data) => ({
  type: 'SET INVOICE IDS',
  path,
  payload: data,
  reducer: (state, {setOrUpdate, ids}) => setOrUpdate ? ids : [...state, ...ids],
})

const savePagedIds = ({path, ids, nextId, setOrUpdate}) =>
  (dispatch) => {
    dispatch(setData([...path, 'nextId'])(nextId))
    dispatch(setInvoiceIds([...path, 'ids'], {ids, setOrUpdate}))
  }


const setInvoice = (id) => setData(['invoices', id])
const setInvoiceNotFound = (id) => setInvoice(id)({notFound: true})

const setInvoices = (data) => ({
  type: 'SET INVOICES',
  path: ['invoices'],
  payload: data,
  reducer: (state, data) => ({
    ...state,
    ...data,
  }),
})

export const getInvoiceMeta = (id) => loadingWrapper(
  async (dispatch, getState, {api}) => {
    try {
      const meta = await api.invoices.getMeta(id)
      dispatch(setInvoice(id)(meta))
    } catch (error) {
      if (error.statusCode === 404) {
        dispatch(setInvoiceNotFound(id))
      } else {
        await swal({
          title: `Invoice ${id} could not be fetched`,
          text: error.message,
          icon: 'error',
        })
      }
    }
  }
)

export const createInvoice = (data) => loadingWrapper(
  async (dispatch, getState, {api}) => {
    try {
      const invoice = await api.invoices.create(data)
      dispatch(setInvoices({
        [invoice.id]: invoice,
      }))

      const redirect = await swal({
        title: 'Invoice was created',
        icon: 'success',
        buttons: ['Create another', 'Check detail'],
      })
      return {
        invoiceId: invoice.id,
        redirect,
      }
    } catch (error) {
      let text = error.message
      if (error.detail) text += `\n${error.detail}`
      await swal({
        title: 'Invoice could not be created',
        text,
        icon: 'error',
      })
      return {
        invoiceId: null,
        redirect: false,
      }
    }
  }
)

const getInvoices = ({path, fetchInvoices}) => (query, startId) => loadingWrapper(
  async (dispatch, getState, {api}) => {
    try {
      const {invoices, nextId} = await fetchInvoices(api)(query, startId)

      dispatch(setInvoices(
        invoices.reduce((acc, val) => ({
          ...acc,
          [val.id]: val,
        }), {})
      ))

      dispatch(savePagedIds({
        path,
        ids: invoices.reduce((acc, val) => ([
          ...acc,
          val.id,
        ]), []),
        nextId,
        setOrUpdate: startId == null,
      }))
    } catch (error) {
      await swal({
        title: 'Invoices could not be fetched',
        text: error.message,
        icon: 'error',
      })
    }
  }
)

export const getMyInvoices = getInvoices({
  path: ['myInvoicesScreen'],
  fetchInvoices: (api) => api.users.getMyInvoices,
})

export const getPublicInvoices = getInvoices({
  path: ['publicInvoicesScreen'],
  fetchInvoices: (api) => api.invoices.getPublic,
})
