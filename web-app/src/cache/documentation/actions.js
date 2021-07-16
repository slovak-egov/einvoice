import swal from 'sweetalert'
import {loadingWrapper, setData} from '../../helpers/actions'
import i18n from '../../i18n'

const setUblInvoiceDocs = setData(['docs', 'ubl2.1', 'invoice'])
const setUblCreditNoteDocs = setData(['docs', 'ubl2.1', 'creditNote'])
const setUblRulesDocs = setData(['docs', 'ubl2.1', 'rules'])
const setBusinessTermsDocs = setData(['docs', 'businessTerms'])
const setCodeLists = setData(['docs', 'codeLists'])
const setFormValidation = setData(['docs', 'formValidations'])

export const getUblInvoiceDocs = () => loadingWrapper(
  async (dispatch, getState, {api}) => {
    try {
      const documentation = await api.documentation.getUblInvoice()
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
      const documentation = await api.documentation.getUblCreditNote()
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
      const documentation = await api.documentation.getUblRules()
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

export const getBusinessTermsDocs = () => loadingWrapper(
  async (dispatch, getState, {api}) => {
    try {
      const docs = await api.documentation.getBusinessTerms()
      dispatch(setBusinessTermsDocs(docs))
    } catch (error) {
      await swal({
        title: i18n.t('errorMessages.getBusinessTerms'),
        text: error.message,
        icon: 'error',
      })
    }
  }
)

export const getCodeLists = () => loadingWrapper(
  async (dispatch, getState, {api}) => {
    try {
      const codeLists = await api.documentation.getCodeLists()
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

export const getFormValidationDocs = () => loadingWrapper(
  async (dispatch, getState, {api}) => {
    try {
      const docs = await api.documentation.getFormValidations()
      dispatch(setFormValidation(docs))
    } catch (error) {
      await swal({
        title: i18n.t('errorMessages.getFormValidations'),
        text: error.message,
        icon: 'error',
      })
    }
  }
)
