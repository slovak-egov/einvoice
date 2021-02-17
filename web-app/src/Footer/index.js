import './Footer.css'
import {Nav} from 'react-bootstrap'
import {NavLink} from 'react-router-dom'
import {useTranslation} from 'react-i18next'

export default () => {
  const {t} = useTranslation('common')
  return (
    <Nav className="footer-wrapper bg-dark">
      <NavLink to="/faq" className="footer-link">
        FAQ
      </NavLink>
      <NavLink to="/invoice-documentation" className="footer-link">
        {t('invoiceDocumentation')}
      </NavLink>
      <a href="https://github.com/slovak-egov/einvoice" target="_blank" className="footer-link">
        Github
      </a>
    </Nav>
  )
}
