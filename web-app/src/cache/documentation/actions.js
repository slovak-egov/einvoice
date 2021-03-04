import swal from 'sweetalert'
import {loadingWrapper, setData} from '../../helpers/actions'
import i18n from '../../i18n'

const setUblInvoiceDocs = setData(['docs', 'ubl2.1', 'invoice'])
const setUblCreditNoteDocs = setData(['docs', 'ubl2.1', 'creditNote'])
const setUblRulesDocs = setData(['docs', 'ubl2.1', 'rules'])
const setCodeLists = setData(['docs', 'codeLists'])

export const getUblInvoiceDocs = () => loadingWrapper(
  async (dispatch, getState, {api}) => {
    try {
      const documentation = await api.getUblInvoiceDocumentation()
      dispatch(setUblInvoiceDocs(documentation))
    } catch (error) {
      await swal({
        title: i18n.t('errorMessages.getUblInvoiceDocs'),
        text: error.message,
        icon: 'error',
      })
    }
  }
)

export const getUblCreditNoteDocs = () => loadingWrapper(
  async (dispatch, getState, {api}) => {
    try {
      const documentation = await api.getUblCreditNoteDocumentation()
      dispatch(setUblCreditNoteDocs(documentation))
    } catch (error) {
      await swal({
        title: i18n.t('errorMessages.getUblCreditNoteDocs'),
        text: error.message,
        icon: 'error',
      })
    }
  }
)

export const getUblRulesDocs = () => loadingWrapper(
  async (dispatch, getState, {api}) => {
    try {
      const documentation = await api.getUblRulesDocumentation()
      dispatch(setUblRulesDocs(documentation))
    } catch (error) {
      await swal({
        title: i18n.t('errorMessages.getUblRulesDocs'),
        text: error.message,
        icon: 'error',
      })
    }
  }
)

export const getCodeLists = () => loadingWrapper(
  async (dispatch, getState, {api}) => {
    try {
      const codeLists = await api.getCodeLists()
      dispatch(setCodeLists(codeLists))
    } catch (error) {
      await swal({
        title: i18n.t('errorMessages.getCodeLists'),
        text: error.message,
        icon: 'error',
      })
    }
  }
)
