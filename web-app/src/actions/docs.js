import {loadingWrapper, setData} from './common'
import swal from 'sweetalert'

export const setUblDocs = setData(['docs', 'ubl2.1'])
export const setCodeLists = setData(['docs', 'codeLists'])

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

export const getCodeLists = () => loadingWrapper(
  async (dispatch, getState, {api}) => {
    try {
      const codeLists = await api.getCodeLists()
      dispatch(setCodeLists(codeLists))
    } catch (error) {
      await swal({
        title: 'Code lists could not be fetched',
        text: error.message,
        icon: 'error',
      })
    }
  }
)
