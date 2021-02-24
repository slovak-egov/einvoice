import swal from 'sweetalert'
import {loadingWrapper, setData} from '../../helpers/actions'
import i18n from '../../i18n'

const setSubstitutes = (id) => setData(['users', id, 'substituteIds'])

const removeSubstitute = (userId, substituteId) => ({
  type: 'REMOVE SUBSTITUTE',
  path: ['users', userId, 'substituteIds'],
  payload: substituteId,
  reducer: (state, substituteId) => state.filter((s) => s !== substituteId),
})

const addSubstitute = (userId, substituteId) => ({
  type: 'ADD SUBSTITUTE',
  path: ['users', userId, 'substituteIds'],
  payload: substituteId,
  reducer: (state, substituteId) => [...state, substituteId],
})

export const getUserSubstitutes = () => loadingWrapper(
  async (dispatch, getState, {api}) => {
    try {
      const substituteIds = await api.users.getSubstituteIds()
      dispatch(setSubstitutes(localStorage.getItem('userId'))(substituteIds))
    } catch (error) {
      await swal({
        title: i18n.t('errorMessages.getUserSubstitutes'),
        text: error.message,
        icon: 'error',
      })
    }
  }
)

export const removeUserSubstitute = (id) => loadingWrapper(
  async (dispatch, getState, {api}) => {
    try {
      const [deletedId] = await api.users.removeSubstitute(id)
      dispatch(removeSubstitute(localStorage.getItem('userId'), deletedId))
    } catch (error) {
      await swal({
        title: i18n.t('errorMessages.removeUserSubstitute'),
        text: error.message,
        icon: 'error',
      })
    }
  }
)

export const addUserSubstitute = (id) => loadingWrapper(
  async (dispatch, getState, {api}) => {
    try {
      const addedIds = await api.users.addSubstitute(parseInt(id, 10))
      if (addedIds.length > 0) {
        dispatch(addSubstitute(localStorage.getItem('userId'), addedIds[0]))
        return true
      } else {
        await swal({
          title: i18n.t('errorMessages.addUserSubstitute.title'),
          text: i18n.t('errorMessages.addUserSubstitute.alreadyAdded'),
          icon: 'error',
        })
        return false
      }
    } catch (error) {
      await swal({
        title: i18n.t('errorMessages.addUserSubstitute.title'),
        text: error.message,
        icon: 'error',
      })
      return false
    }
  }
)
