export const CONFIG = process.env.NODE_ENV === 'development' ?
  {
    apiServerUrl: process.env.REACT_APP_APISERVER_URL,
    upvsLoginUrl: process.env.REACT_APP_UPVS_LOGIN_URL,
    logoutCallbackUrl: process.env.REACT_APP_LOGOUT_CALLBACK_URL,
  } :
  JSON.parse(document.getElementsByTagName('body')[0].dataset.einvoiceconfig)
