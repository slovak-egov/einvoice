import {loadingWrapper, setData} from './common'
import swal from 'sweetalert'

const setSubstitutes = (id) => setData(['users', id, 'substituteIds'])
export const setNewSubstituteId = setData(['accountScreen', 'newSubstituteId'])

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
      const substituteIds = await api.getUserSubstituteIds()
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
      const [deletedId] = await api.removeUserSubstitute(id)
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
      const addedIds = await api.addUserSubstitute(parseInt(id))
      if (addedIds.length > 0) {
        dispatch(addSubstitute(localStorage.getItem('userId'), addedIds[0]))
        return true
      } else {
        await swal({
          title: 'User substitute could not be added',
          text: 'This user is substitute already',
          icon: 'error',
        })
      }
    } catch (error) {
      await swal({
        title: 'User substitute could not be added',
        text: error.message,
        icon: 'error',
      })
    }
  }
)
