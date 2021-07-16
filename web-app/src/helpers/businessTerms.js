import {Link} from 'react-router-dom'

export const addBusinessTermsLinks = (msg, businessTerms) => {
  if (!businessTerms) return msg

  const reg = new RegExp(`(${businessTerms.join('|')})`, 'g')
  const parts = msg.split(reg)
  for (let i = 1; i < parts.length; i += 2) {
    parts[i] = <Link key={i} to={`/invoiceDocumentation/businessTerms/${parts[i]}`}>{parts[i]}</Link>
  }
  return parts
}

export const businessTermLink = (id) => <Link to={`/invoiceDocumentation/businessTerms/${id}`}>{id}</Link>
