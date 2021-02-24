import swal from 'sweetalert'
import {loadingWrapper, setData} from '../../helpers/actions'
import i18n from '../../i18n'

const setUblDocs = setData(['docs', 'ubl2.1'])
const setCodeLists = setData(['docs', 'codeLists'])

export const getUblDocs = () => loadingWrapper(
  async (dispatch, getState, {api}) => {
    try {
      const documentation = await api.getUbl21Documentation()
      dispatch(setUblDocs(documentation))
    } catch (error) {
      await swal({
        title: i18n.t('errorMessages.getUblDocs'),
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
