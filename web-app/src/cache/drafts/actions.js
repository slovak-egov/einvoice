import swal from 'sweetalert'
import {loadingWrapper, setData} from '../../helpers/actions'
import i18n from '../../i18n'

const setDrafts = setData(['drafts'])

const removeDraft = (draftId) => ({
  type: 'REMOVE DRAFT',
  path: ['drafts'],
  payload: draftId,
  reducer: (state, draftId) => state.filter((d) => d.id !== draftId),
})

export const getDrafts = () => loadingWrapper(
  async (dispatch, getState, {api}) => {
    try {
      const data = await api.drafts.getAll()
      dispatch(setDrafts(data))
    } catch (error) {
      await swal({
        title: i18n.t('errorMessages.getDrafts'),
        text: error.message,
        icon: 'error',
      })
    }
  }
)

export const deleteDraft = (id) => loadingWrapper(
  async (dispatch, getState, {api}) => {
    try {
      const response = await api.drafts.remove(id)
      dispatch(removeDraft(response.id))
    } catch (error) {
      await swal({
        title: i18n.t('errorMessages.deleteDraft'),
        text: error.message,
        icon: 'error',
      })
    }
  }
)

export const createDraft = (name, type, data) => loadingWrapper(
  async (dispatch, getState, {api}) => {
    try {
      const draft = await api.drafts.create(name, {type, data})
      return draft
    } catch (error) {
      await swal({
        title: i18n.t('errorMessages.createDraft'),
        text: error.message,
        icon: 'error',
      })
      return false
    }
  }
)

export const updateDraft = ({id, name, type, data}) => loadingWrapper(
  async (dispatch, getState, {api}) => {
    try {
      await api.drafts.update({id, name, data: type && data && {type, data}})
      return true
    } catch (error) {
      await swal({
        title: i18n.t('errorMessages.updateDraft'),
        text: error.message,
        icon: 'error',
      })
      return false
    }
  }
)
