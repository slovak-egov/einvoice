import {useCallback} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Button, Nav, Navbar, NavDropdown} from 'react-bootstrap'
import {IndexLinkContainer} from 'react-router-bootstrap'
import {useTranslation} from 'react-i18next'
import {CONFIG} from '../appSettings'
import {updateRunningRequests} from '../actions/common'
import {getLoggedUser, isUserLogged} from '../state/users'
import {getLogoutUrl} from '../utils/constants'

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
      <IndexLinkContainer to="/">
        <Navbar.Brand>{t('topBar.title')}</Navbar.Brand>
      </IndexLinkContainer>
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
          <IndexLinkContainer to="/invoices">
            <Nav.Link className="mr-auto">
              {t('topBar.publicInvoices')}
            </Nav.Link>
          </IndexLinkContainer>
          {isLogged ?
            <>
              <IndexLinkContainer to="/create-invoice">
                <Nav.Link>{t('topBar.createInvoice')}</Nav.Link>
              </IndexLinkContainer>
              <IndexLinkContainer to="/my-invoices">
                <Nav.Link>{t('topBar.myInvoices')}</Nav.Link>
              </IndexLinkContainer>
              <IndexLinkContainer to="/account">
                <Nav.Link>{loggedUser.name}</Nav.Link>
              </IndexLinkContainer>
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
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}
