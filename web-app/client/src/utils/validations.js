const areFormatsValid = (formats) =>
  Object.values(formats).reduce((acc, v) => acc || v, false)

const isIcoValid = ({value, send}) => !send || value.length === 8

export const isInvoicesFilterValid = ({formats, ico}) =>
  areFormatsValid(formats) && isIcoValid(ico)

export const keepDigitsOnly = (v) => v.replace(/[^0-9]/g, '')
