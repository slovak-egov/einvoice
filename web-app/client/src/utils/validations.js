export const isInvoicesFilterValid = (filters) =>
  Object.values(filters.formats).reduce((acc, v) => acc || v, false)
