import {invoiceTypes} from '../../../utils/constants'

export const getDoc = (docs, path, creditNotePath, formType) => {
  let node = docs
  if (formType === invoiceTypes.CREDIT_NOTE) {
    path = creditNotePath
  }
  path.forEach((name) => {
    if (node.children && node.children[name]) node = node.children[name]
    else node = node.attributes[name]
  })
  return node
}
