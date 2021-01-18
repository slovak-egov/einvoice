import {loadingWrapper, setData} from './common'
import swal from 'sweetalert'

export const setUblDocs = setData(['docs', 'ubl2.1'])
export const setInvoiceRulesDocs = setData(['docs', 'rules'])

export const getUblDocs = () => loadingWrapper(
  async (dispatch, getState, {api}) => {
    try {
      const docs = await api.getUbl21Docs()
      dispatch(setUblDocs(docs))
    } catch (error) {
      await swal({
        title: 'UBL2.1 docs could not be fetched',
        text: error.message,
        icon: 'error',
      })
    }
  }
)

export const getInvoiceRulesDocs = () => loadingWrapper(
  async (dispatch, getState, {api}) => {
    try {
      const rules = await api.getInvoiceRulesDocs()
      dispatch(setInvoiceRulesDocs(rules))
    } catch (error) {
      await swal({
        title: 'Invoice rules docs could not be fetched',
        text: error.message,
        icon: 'error',
      })
    }
  }
)
