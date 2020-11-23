import swal from 'sweetalert'
import {loadingWrapper, setData} from './common'

const setLogging = setData(['logging'])
const setLoggedUserId = setData(['loggedUserId'])
const setUser = (id) => setData(['users', id])

const updateUserData = (userId, data) => ({
  type: 'UPDATE USER',
  path: ['users', userId],
  payload: data,
  reducer: (state, data) => ({...state, ...data}),
})

const removeLoggedUser = () =>
  async (dispatch) => {
    dispatch(setLoggedUserId(null))
    dispatch(setLogging(false))
  }

export const getMyInfo = () =>
  async (dispatch, getState, {api}) => {
    dispatch(setLogging(true))
    if (localStorage.getItem('token')) {
      try {
        const userData = await api.getUserInfo()
        dispatch(setUser(userData.id)(userData))
        dispatch(setLoggedUserId(userData.id))
        dispatch(setLogging(false))
      } catch (error) {
        if (process.env.NODE_ENV === 'production') {
          localStorage.removeItem('token')
          localStorage.removeItem('userId')
        }
        dispatch(removeLoggedUser())
      }
    } else {
      dispatch(removeLoggedUser())
    }
  }

export const updateUser = (data) => loadingWrapper(
  async (dispatch, getState, {api}) => {
    try {
      const userData = await api.updateUser(data)
      dispatch(updateUserData(userData.id, userData))
      return true
    } catch (error) {
      await swal({
        title: 'User data could not be updated',
        text: error.message,
        icon: 'error',
      })
    }
  }
)

export const loginWithSlovenskoSkToken = (token) => (
  async (dispatch, getState, {api}) => {
    try {
      const userData = await api.loginWithSlovenskoSkToken(token)
      localStorage.setItem('token', userData.token)
      localStorage.setItem('userId', userData.id)
      dispatch(setUser(userData.id)(userData))
      dispatch(setLoggedUserId(userData.id))
      dispatch(setLogging(false))
      return true
    } catch (error) {
      dispatch(removeLoggedUser())
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      await swal({
        title: 'Login failed',
        text: error.message,
        icon: 'error',
      })
      return false
    }
  }
)

export const logout = () => (
  async (dispatch, getState, {api}) => {
    await api.logout()
    dispatch(removeLoggedUser())
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
  }
)
