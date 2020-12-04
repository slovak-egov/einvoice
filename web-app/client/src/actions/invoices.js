import swal from 'sweetalert'
import {get} from 'lodash'
import {setData, loadingWrapper} from './common'

const setPublicInvoiceIds = setData(['publicInvoicesScreen', 'ids'])
const setMyInvoiceIds = setData(['myInvoicesScreen', 'ids'])

export const setCreateInvoiceFormat = setData(['createInvoiceScreen', 'format'])
export const setCreateInvoiceData = setData(['createInvoiceScreen', 'invoice'])

const setInvoice = (id, data) => ({
  type: 'SET INVOICES',
  path: ['invoices', id],
  payload: data,
  reducer: (state, data) => ({
    ...state,
    ...data,
  }),
})

const setInvoices = (data) => ({
  type: 'SET INVOICES',
  path: ['invoices'],
  payload: data,
  reducer: (state, data) => ({
    ...state,
    ...data,
  }),
})

const setInvoiceNotFound = (id) => ({
  type: 'SET INVOICE NOT FOUND',
  path: ['invoices', id],
  payload: null,
  reducer: () => ({
    notFound: true,
    data: '',
  }),
})

export const getInvoiceDetail = (id) => loadingWrapper(
  async (dispatch, getState, {api}) => {
    try {
      const invoiceDetail = await api.getInvoiceDetail(id)
      dispatch(setInvoice(id, {data: invoiceDetail}))
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

export const getInvoiceMeta = (id) => loadingWrapper(
  async (dispatch, getState, {api}) => {
    try {
      const meta = await api.getInvoiceMeta(id)
      dispatch(setInvoice(id, meta))
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
      const invoice = await api.createInvoice(data)
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
      await swal({
        title: 'Invoice could not be created',
        text: error.message,
        icon: 'error',
      })
      return {
        invoiceId: null,
        redirect: false,
      }
    }
  }
)

const getInvoices = ({getAdditionalFilters, path, setIds, fetchInvoices}) => () => loadingWrapper(
  async (dispatch, getState, {api}) => {
    const filters = get(getState(), [...path, 'filters'])
    const formats = Object.keys(filters.formats).filter((k) => filters.formats[k])

    try {
      const {invoices} = await fetchInvoices(api)({formats, ...getAdditionalFilters(filters)})
      dispatch(setInvoices(
        invoices.reduce((acc, val) => ({
          ...acc,
          [val.id]: val,
        }), {})
      ))

      dispatch(setIds(
        invoices.reduce((acc, val) => ([
          ...acc,
          val.id,
        ]), []))
      )
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
  setIds: setMyInvoiceIds,
  fetchInvoices: (api) => api.getMyInvoices,
  getAdditionalFilters: (filters) => ({
    supplied: filters.supplied,
    received: filters.received,
  }),
})

export const getPublicInvoices = getInvoices({
  path: ['publicInvoicesScreen'],
  setIds: setPublicInvoiceIds,
  fetchInvoices: (api) => api.getPublicInvoices,
  getAdditionalFilters: () => null,
})
