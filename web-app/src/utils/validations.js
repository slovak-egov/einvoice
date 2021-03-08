const areFormatsValid = (formats) =>
  Object.values(formats).reduce((acc, {value}) => acc || value, false)

const isIcoValid = (ico) => ico == null || ico.length === 8

const isAmountValid = (amount) => amount == null || amount.match(/^[+-]?([0-9]*[.])?[0-9]+$/)

const isIntervalValid = (low, high) =>
  low == null || high == null || parseFloat(low) <= parseFloat(high)

export const isInvoicesFilterValid = ({
  formats, ico, amountFrom, amountTo, amountWithoutVatFrom, amountWithoutVatTo,
}) =>
  areFormatsValid(formats) &&
  isIcoValid(ico) &&
  isAmountValid(amountFrom) &&
  isAmountValid(amountTo) &&
  isAmountValid(amountWithoutVatFrom) &&
  isAmountValid(amountWithoutVatTo) &&
  isIntervalValid(amountFrom, amountTo) &&
  isIntervalValid(amountWithoutVatFrom, amountWithoutVatTo)

export const keepDigitsOnly = (v) => v.replace(/[^0-9]/g, '')

export const keepFloatCharactersOnly = (v) => v.replace(/[^0-9.-]/g, '')
