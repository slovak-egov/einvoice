import {useCallback} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Button, Nav, Navbar, NavDropdown} from 'react-bootstrap'
import {NavLink} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {CONFIG} from '../appSettings'
import {updateRunningRequests} from '../actions/common'
import {getLoggedUser, isUserLogged} from '../state/users'
import {getLogoutUrl} from '../utils/constants'

const TopBar = () => {
  const {i18n, t} = useTranslation('TopBar')

  const isLogged = useSelector(isUserLogged)
  const loggedUser = useSelector(getLoggedUser)

  const dispatch = useDispatch()
  const startLoading = useCallback(
    () => dispatch(updateRunningRequests(1)), [dispatch]
  )

  return (
    <Navbar bg="primary" variant="dark" sticky="top" expand="md">
      <NavLink to="/">
        <Navbar.Brand>{t('title')}</Navbar.Brand>
      </NavLink>
      <Navbar.Toggle />
      <Navbar.Collapse>
        <Nav className="mr-auto">
          <NavDropdown className="nav-link" title={i18n.language.toUpperCase()}>
            <NavDropdown.Item active={i18n.language === 'sk'} onClick={() => i18n.changeLanguage('sk')}>
              SK
            </NavDropdown.Item>
            <NavDropdown.Item active={i18n.language === 'en'} onClick={() => i18n.changeLanguage('en')}>
              EN
            </NavDropdown.Item>
          </NavDropdown>
          <NavLink className="nav-link" to="/invoices">
            <Navbar.Text>{t('tabs.publicInvoices')}</Navbar.Text>
          </NavLink>
        </Nav>
        <Nav>
          {isLogged ?
            <>
              <NavLink className="nav-link" to="/create-invoice">
                <Navbar.Text>{t('tabs.createInvoice')}</Navbar.Text>
              </NavLink>
              <NavLink className="nav-link" to="/my-invoices">
                <Navbar.Text>{t('tabs.myInvoices')}</Navbar.Text>
              </NavLink>
              <NavLink className="nav-link" to="/account">
                <Navbar.Text>{loggedUser.name}</Navbar.Text>
              </NavLink>
              <div className="nav-link">
                <a href={getLogoutUrl()}>
                  <Button variant="danger" onClick={startLoading}>
                    {t('logout')}
                  </Button>
                </a>
              </div>
            </>
            :
            <a href={CONFIG.slovenskoSkLoginUrl}>
              <Button variant="success" onClick={startLoading}>
                {t('login')}
              </Button>
            </a>
          }
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}

export default TopBar
