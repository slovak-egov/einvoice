import swal from 'sweetalert'
import {loadingWrapper, setData} from '../../helpers/actions'

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
        title: 'User substitutes could not be fetched',
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
        title: 'User substitute could not be removed',
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
          title: 'User substitute could not be added',
          text: 'This user is substitute already',
          icon: 'error',
        })
        return false
      }
    } catch (error) {
      await swal({
        title: 'User substitute could not be added',
        text: error.message,
        icon: 'error',
      })
      return false
    }
  }
)
