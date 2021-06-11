import {invoiceTypes} from '../../../utils/constants'
import {Link} from 'react-router-dom'

export const businessTermLink = (id) => <Link to={`/invoiceDocumentation/businessTerms/${id}`}>{id}</Link>

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
