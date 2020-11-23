import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers} from 'recompose'
import {Button, Dropdown, DropdownButton, Navbar} from 'react-bootstrap'
import {NavLink, withRouter} from 'react-router-dom'
import {withTranslation} from 'react-i18next'
import {CONFIG} from '../appSettings'
import {logout} from '../actions/users'
import {updateRunningRequests} from '../actions/common'
import {getLoggedUser, isLogged} from '../state/users'

const TopBar = ({i18n, isLogged, loggedUser, logout, startLoading, t}) => (
  <Navbar bg="primary" variant="dark">
    <NavLink to="/">
      <Navbar.Brand>{t('title')}</Navbar.Brand>
    </NavLink>
    <DropdownButton size="sm" title={i18n.language.toUpperCase()} variant="secondary">
      <Dropdown.Item active={i18n.language === 'sk'} onClick={() => i18n.changeLanguage('sk')}>
        SK
      </Dropdown.Item>
      <Dropdown.Item active={i18n.language === 'en'} onClick={() => i18n.changeLanguage('en')}>
        EN
      </Dropdown.Item>
    </DropdownButton>
    <NavLink className="nav-link" to="/invoices">
      <Navbar.Text>{t('tabs.allInvoices')}</Navbar.Text>
    </NavLink>
    <Navbar.Collapse className="justify-content-end">
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
          <Button variant="danger" onClick={logout}>{t('logout')}</Button>
        </React.Fragment>
        :
        <a href={CONFIG.slovenskoSkLoginUrl}>
          <Button variant="success" onClick={startLoading}>
            {t('login')}
          </Button>
        </a>
      }
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
