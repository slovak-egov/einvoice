import swal from 'sweetalert'
import {loadingWrapper, setData} from '../../helpers/actions'
import i18n from '../../i18n'

const setLogging = setData(['logging'])
const setLoggedUserId = setData(['loggedUserId'])
const setUser = (id) => setData(['users', id])
const setUserOrganizationIds = (id) => setData(['users', id, 'organizationIds'])

const updateUserData = (userId, data) => ({
  type: 'UPDATE USER',
  path: ['users', userId],
  payload: data,
  reducer: (state, data) => ({...state, ...data}),
})

const removeLoggedUser = (removeLocalStorage = true) =>
  (dispatch) => {
    dispatch(setLoggedUserId(null))
    dispatch(setLogging(false))
    if (removeLocalStorage) {
      localStorage.removeItem('sessionToken')
      localStorage.removeItem('userId')
      localStorage.removeItem('oboToken')
    }
  }

export const getMyInfo = () =>
  async (dispatch, getState, {api}) => {
    dispatch(setLogging(true))
    if (localStorage.getItem('sessionToken')) {
      try {
        const userData = await api.users.getInfo()
        dispatch(setUser(userData.id)(userData))
        dispatch(setLoggedUserId(userData.id))
        dispatch(setLogging(false))
      } catch (error) {
        dispatch(removeLoggedUser(process.env.NODE_ENV === 'production'))
      }
    } else {
      dispatch(removeLoggedUser())
    }
  }

export const updateUser = (data) => loadingWrapper(
  async (dispatch, getState, {api}) => {
    try {
      const userData = await api.users.updateInfo(data)
      dispatch(updateUserData(userData.id, userData))
      return true
    } catch (error) {
      await swal({
        title: i18n.t('errorMessages.updateUser'),
        text: error.message,
        icon: 'error',
      })
      return false
    }
  }
)

export const login = (token) => (
  async (dispatch, getState, {api}) => {
    try {
      const userData = await api.login(token)
      localStorage.setItem('sessionToken', userData.token)
      localStorage.setItem('userId', userData.id)
      localStorage.setItem('oboToken', token)
      dispatch(setUser(userData.id)(userData))
      dispatch(setLoggedUserId(userData.id))
      dispatch(setLogging(false))
      return true
    } catch (error) {
      dispatch(removeLoggedUser())
      await swal({
        title: i18n.t('errorMessages.failedLogin'),
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
  }
)

export const getUserOrganizationIds = () => loadingWrapper(
  async (dispatch, getState, {api}) => {
    try {
      const organizationIds = await api.users.getOrganizationIds()
      dispatch(setUserOrganizationIds(localStorage.getItem('userId'))(organizationIds))
    } catch (error) {
      await swal({
        title: i18n.t('errorMessages.getUserOrganizationIds'),
        text: error.message,
        icon: 'error',
      })
    }
  }
)
