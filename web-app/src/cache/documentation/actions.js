import swal from 'sweetalert'
import {loadingWrapper, setData} from '../../helpers/actions'
import i18n from '../../i18n'

const setUblXsdDocs = setData(['docs', 'ubl2.1', 'xsd'])
const setUblRulesDocs = setData(['docs', 'ubl2.1', 'rules'])
const setCodeLists = setData(['docs', 'codeLists'])

export const getUblXsdDocs = () => loadingWrapper(
  async (dispatch, getState, {api}) => {
    try {
      const documentation = await api.getUbl21XsdDocumentation()
      dispatch(setUblXsdDocs(documentation))
    } catch (error) {
      await swal({
        title: i18n.t('errorMessages.getUblXsdDocs'),
        text: error.message,
        icon: 'error',
      })
    }
  }
)

export const getUblRulesDocs = () => loadingWrapper(
  async (dispatch, getState, {api}) => {
    try {
      const documentation = await api.getUbl21RulesDocumentation()
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
