const areFormatsValid = (formats) =>
  Object.values(formats).reduce((acc, {value}) => acc || value, false)

const isIcoValid = (ico) => ico == null || ico.length === 8

export const isInvoicesFilterValid = ({formats, ico}) =>
  areFormatsValid(formats) && isIcoValid(ico)

export const keepDigitsOnly = (v) => v.replace(/[^0-9]/g, '')
