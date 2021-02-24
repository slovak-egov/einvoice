import swal from 'sweetalert'
import {loadingWrapper, setData} from '../../helpers/actions'
import i18n from '../../i18n'

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

export const setInvoices = (data) => ({
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
          title: i18n.t('errorMessages.getInvoiceMeta', {id}),
          text: error.message,
          icon: 'error',
        })
      }
    }
  }
)

export const getInvoices = ({path, fetchInvoices}) => (query, startId) => loadingWrapper(
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
        title: i18n.t('errorMessages.getInvoices'),
        text: error.message,
        icon: 'error',
      })
    }
  }
)
