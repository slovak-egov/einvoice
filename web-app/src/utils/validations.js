const areFormatsValid = (ublFormat, d16bFormat) => ublFormat || d16bFormat

const isIcoValid = (ico) => ico == null || ico.length === 8

const isAmountValid = (amount) => amount == null || amount.match(/^[+-]?([0-9]*[.])?[0-9]+$/)

const isIntervalValid = (low, high) =>
  low == null || high == null || parseFloat(low) <= parseFloat(high)

const isTimeIntervalValid = (low, high) =>
  (low == null || high == null || low <= high) && low !== '' && high !== ''

export const isInvoicesFilterValid = ({
  ublFormat, d16bFormat, amountFrom, amountTo, amountWithoutVatFrom, amountWithoutVatTo,
  issueDateFrom, issueDateTo, uploadTimeFrom, uploadTimeTo, customerIco, supplierIco,
}) =>
  areFormatsValid(ublFormat, d16bFormat) &&
  isIcoValid(customerIco) &&
  isIcoValid(supplierIco) &&
  isAmountValid(amountFrom) &&
  isAmountValid(amountTo) &&
  isAmountValid(amountWithoutVatFrom) &&
  isAmountValid(amountWithoutVatTo) &&
  isIntervalValid(amountFrom, amountTo) &&
  isIntervalValid(amountWithoutVatFrom, amountWithoutVatTo) &&
  isTimeIntervalValid(issueDateFrom, issueDateTo) &&
  isTimeIntervalValid(uploadTimeFrom, uploadTimeTo)

export const keepDigitsOnly = (v) => v.replace(/[^0-9]/g, '')

export const keepFloatCharactersOnly = (v) => v.replace(/[^0-9.-]/g, '')
