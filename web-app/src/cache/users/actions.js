import swal from 'sweetalert'
import {loadingWrapper, setData} from '../../helpers/actions'
import i18n from '../../i18n'
import {getLogoutUrl, upvsForbiddenSubstitutionError} from '../../utils/constants'

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
      localStorage.setItem('oboToken', token)
      const userData = await api.login(token)
      localStorage.setItem('sessionToken', userData.token)
      localStorage.setItem('userId', userData.id)
      dispatch(setUser(userData.id)(userData))
      dispatch(setLoggedUserId(userData.id))
      dispatch(setLogging(false))
      return true
    } catch (error) {
      if (error.message === upvsForbiddenSubstitutionError) {
        const logout = await swal({
          title: i18n.t('errorMessages.failedLogin'),
          text: i18n.t('errorMessages.forbiddenSubstitution'),
          icon: 'error',
          buttons: {
            logout: {
              text: i18n.t('upvsLogout'),
              value: true,
            },
            close: {
              text: i18n.t('close'),
              value: false,
            },
          },
        })
        if (logout) {
          // TODO: make it nicer
          const logoutUrl = getLogoutUrl()
          dispatch(removeLoggedUser())
          window.location.href = logoutUrl
        } else {
          dispatch(removeLoggedUser())
          return false
        }
      } else {
        dispatch(removeLoggedUser())
        await swal({
          title: i18n.t('errorMessages.failedLogin'),
          text: error.message,
          icon: 'error',
        })
      }
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
