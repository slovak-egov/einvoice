import {useCallback} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Button, Nav, Navbar, NavDropdown} from 'react-bootstrap'
import {LinkContainer} from 'react-router-bootstrap'
import {useTranslation} from 'react-i18next'
import {CONFIG} from '../appSettings'
import {updateRunningRequests} from '../actions/common'
import {getLoggedUser, isUserLogged} from '../state/users'
import {getLogoutUrl} from '../utils/constants'

export default () => {
  const {i18n, t} = useTranslation('TopBar')

  const isLogged = useSelector(isUserLogged)
  const loggedUser = useSelector(getLoggedUser)

  const dispatch = useDispatch()
  const startLoading = useCallback(
    () => dispatch(updateRunningRequests(1)), [dispatch]
  )

  return (
    <Navbar bg="primary" variant="dark" sticky="top" expand="md" collapseOnSelect>
      <LinkContainer to="/">
        <Navbar.Brand>{t('title')}</Navbar.Brand>
      </LinkContainer>
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
          <LinkContainer to="/invoices">
            <Nav.Link className="mr-auto">
              {t('tabs.publicInvoices')}
            </Nav.Link>
          </LinkContainer>
          {isLogged ?
            <>
              <LinkContainer to="/create-invoice">
                <Nav.Link>{t('tabs.createInvoice')}</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/my-invoices">
                <Nav.Link>{t('tabs.myInvoices')}</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/account">
                <Nav.Link>{loggedUser.name}</Nav.Link>
              </LinkContainer>
              <a href={getLogoutUrl()}>
                <Button variant="danger" onClick={startLoading}>
                  {t('logout')}
                </Button>
              </a>
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
