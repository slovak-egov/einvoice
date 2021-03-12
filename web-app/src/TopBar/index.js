import {useCallback} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {NavLink} from 'react-router-dom'
import {Button, Nav, Navbar, NavDropdown} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'
import {CONFIG} from '../appSettings'
import {updateRunningRequests} from '../helpers/actions'
import {getLoggedUser, isUserLogged} from '../cache/users/state'
import {getLogoutUrl} from '../utils/constants'

const defaultInvoiceQuery = new URLSearchParams([
  ['format', 'ubl2.1'], ['format', 'd16b'],
])

export default () => {
  const {i18n, t} = useTranslation('common')

  const isLogged = useSelector(isUserLogged)
  const loggedUser = useSelector(getLoggedUser)

  const dispatch = useDispatch()
  const startLoading = useCallback(
    () => dispatch(updateRunningRequests(1)), [dispatch]
  )

  return (
    <Navbar bg="primary" variant="dark" sticky="top" expand="md" collapseOnSelect>
      <NavLink to="/">
        <Navbar.Brand>{t('topBar.title')}</Navbar.Brand>
      </NavLink>
      <Navbar.Toggle />
      <Navbar.Collapse>
        <Nav className="w-100">
          <NavDropdown title={i18n.language.toUpperCase()}>
            <NavDropdown.Item active={i18n.language === 'sk'} onClick={() => i18n.changeLanguage('sk')}>
              SK
            </NavDropdown.Item>
            <NavDropdown.Item active={i18n.language === 'en'} onClick={() => i18n.changeLanguage('en')}>
              EN
            </NavDropdown.Item>
          </NavDropdown>
          <Nav.Link as={NavLink} to={`/invoices?${defaultInvoiceQuery}`}>
            {t('topBar.publicInvoices')}
          </Nav.Link>
          <Nav.Link as={NavLink} to="/invoice-tools">{t('topBar.invoiceTools')}</Nav.Link>
          <div className="d-md-flex ml-md-auto">
            {isLogged ?
              <>
                <Nav.Link as={NavLink} to={`/my-invoices?${defaultInvoiceQuery}`}>
                  {t('topBar.myInvoices')}
                </Nav.Link>
                <Nav.Link as={NavLink} to="/account">{loggedUser.name}</Nav.Link>
                <a href={getLogoutUrl()}>
                  <Button variant="danger" onClick={startLoading}>
                    {t('topBar.logout')}
                  </Button>
                </a>
              </>
              :
              <a href={CONFIG.upvsLoginUrl}>
                <Button variant="success" onClick={startLoading}>
                  {t('topBar.login')}
                </Button>
              </a>
            }
          </div>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}
