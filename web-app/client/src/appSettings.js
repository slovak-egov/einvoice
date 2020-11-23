export const CONFIG = process.env.NODE_ENV === 'development' ?
  {
    apiServerUrl: process.env.REACT_APP_APISERVER_URL,
    slovenskoSkLoginUrl: process.env.REACT_APP_SLOVENSKOSK_LOGIN_URL
  } :
  JSON.parse(document.getElementsByTagName('body')[0].dataset.einvoiceconfig)
