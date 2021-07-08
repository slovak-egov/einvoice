import {useCallback, useEffect, useRef} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useLocation} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import classNames from 'classnames'
import HeaderJS from '@id-sk/frontend/idsk/components/header/header'
import {Button, Link, PhaseBanner, Select} from '../helpers/idsk'
import {CONFIG} from '../appSettings'
import {updateRunningRequests} from '../helpers/actions'
import {getLoggedUser, isUserLogged} from '../cache/users/state'
import {getLogoutUrl} from '../utils/constants'

const defaultInvoiceQuery = new URLSearchParams([
  ['format', 'ubl2.1'], ['format', 'd16b'],
])

const getPhase = (hostname) => {
  if (hostname.startsWith('dev')) return 'dev'
  else if (hostname.startsWith('fix')) return 'fix'
  else return null
}

export default () => {
  const {i18n, t} = useTranslation('common')
  const {pathname} = useLocation()

  const isLogged = useSelector(isUserLogged)
  const loggedUser = useSelector(getLoggedUser)

  const dispatch = useDispatch()
  const startLoading = useCallback(
    () => dispatch(updateRunningRequests(1)), [dispatch]
  )

  const headerRef = useRef()
  useEffect(() => {
    new HeaderJS(headerRef.current).init()
  }, [headerRef])

  const phase = getPhase(window.location.hostname)

  return (
    <>
      <header className="idsk-header" data-module="idsk-header" ref={headerRef}>
        <div className="idsk-header__container govuk-header__container--with-user govuk-header__container--full-width">
          <div className="idsk-header__logo">
            <Link to="/" className="idsk-header__link idsk-header__link--homepage" id="homepage-link">
              <span className="idsk-header__logotype">
                {t('topBar.title')}
              </span>
            </Link>
            <span className="idsk-header__product-name">
              <Select
                formGroup={{className: 'mb-0'}}
                value={i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                items={[
                  {value: 'sk', children: 'SK'},
                  {value: 'en', children: 'EN'},
                ]}
              />
            </span>
          </div>
          <div className="idsk-header__content">
            <button type="button" className="idsk-header__menu-button govuk-js-header-toggle" aria-controls="navigation" aria-label="Show or hide Top Level Navigation">
              Menu
            </button>
            <nav>
              <ul id="navigation" className="govuk-header__navigation" aria-label="Top Level Navigation">
                <li className={classNames('idsk-header__navigation-item', pathname.startsWith('/invoices') && 'idsk-header__navigation-item--active')}>
                  <Link className="idsk-header__link" to={`/invoices?${defaultInvoiceQuery}`} id="public-invoices-nav-link">
                    {t('topBar.publicInvoices')}
                  </Link>
                </li>
                <li className={classNames('idsk-header__navigation-item', pathname.startsWith('/invoice-tools') && 'idsk-header__navigation-item--active')}>
                  <Link className="idsk-header__link" to="/invoice-tools" id="invoice-tools-nav-link">
                    {t('topBar.invoiceTools')}
                  </Link>
                </li>
                {isLogged && <li className={classNames('idsk-header__navigation-item', pathname.startsWith('/my-invoices') && 'idsk-header__navigation-item--active')}>
                  <Link className="idsk-header__link" to={`/my-invoices?${defaultInvoiceQuery}`} id="my-invoice-nav-link">
                    {t('topBar.myInvoices')}
                  </Link>
                </li>}
              </ul>
            </nav>
          </div>

          {isLogged ? <div className="idsk-header__user govuk-grid-column-one-quarter idsk-header__user--end">
            <Link to="/account" id="account-image-link">
              <svg className="idsk-header__user-icon" viewBox="0 0 28 28">
                <path
                  d="M5 21.9C5 19.8 6.8 18 9 18h10c2.2 0 4 1.8 4 3.9 1.9-2.1 3-4.9 3-7.9 0-6.6-5.4-12-12-12S2 7.4 2 14c0 3 1.1 5.8 3 7.9zm9 6.1C6.3 28 0 21.7 0 14S6.3 0 14 0s14 6.3 14 14-6.3 14-14 14zm0-12c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z"
                  fillRule="evenodd"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
            <div className="idsk--header__user-name">
              <Link to="/account" className="idsk-header__link" id="account-link">{loggedUser.name}</Link>
              <div onClick={startLoading}>
                <a href={getLogoutUrl()} className="idsk--header__user-logout" id="logout">{t('topBar.logout')}</a>
              </div>
            </div>
          </div> :
          <div className="idsk-header__user--end">
            <a href={CONFIG.upvsLoginUrl} id="login">
              <Button style={{marginBottom: 0}} onClick={startLoading}>
                {t('topBar.login')}
              </Button>
            </a>
          </div>}
        </div>
      </header>
      {phase &&
      <div style={{background: '#DEE0E2'}}>
        <PhaseBanner
          className="container"
          style={{borderBottom: 'none'}}
          tag={{
            children: phase,
          }}
        >
          {t(`phase.${phase}`)}
        </PhaseBanner>
      </div>
      }
    </>
  )
}
