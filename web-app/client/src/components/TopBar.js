import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers} from 'recompose'
import {Button, Nav, Navbar, NavDropdown} from 'react-bootstrap'
import {NavLink, withRouter} from 'react-router-dom'
import {withTranslation} from 'react-i18next'
import {CONFIG} from '../appSettings'
import {logout} from '../actions/users'
import {updateRunningRequests} from '../actions/common'
import {getLoggedUser, isLogged} from '../state/users'

const TopBar = ({i18n, isLogged, loggedUser, logout, startLoading, t}) => (
  <Navbar bg="primary" variant="dark" sticky="top" expand="md">
    <NavLink to="/">
      <Navbar.Brand>{t('title')}</Navbar.Brand>
    </NavLink>
    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
    <Navbar.Collapse id="responsive-navbar-nav">
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
          <Navbar.Text>{t('tabs.allInvoices')}</Navbar.Text>
        </NavLink>
      </Nav>
      <Nav>
        {isLogged ?
          <React.Fragment>
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
              <Button variant="danger" onClick={logout}>{t('logout')}</Button>
            </div>
          </React.Fragment>
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

export default withRouter(
  compose(
    connect(
      (state) => ({
        isLogged: isLogged(state),
        loggedUser: getLoggedUser(state),
      }),
      {logout, updateRunningRequests}
    ),
    withHandlers({
      logout: ({logout, history}) => async () => {
        await logout()
        history.push('/')
      },
      startLoading: ({updateRunningRequests}) => () => updateRunningRequests(1),
    }),
    withTranslation('TopBar'),
  )(TopBar)
)
