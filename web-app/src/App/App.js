import {Suspense, useMemo, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Redirect, Route, Switch} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {registerLocale} from 'react-datepicker'
import sk from 'date-fns/locale/sk'
import PublicInvoices from '../PublicInvoices'
import MyInvoices from '../MyInvoices'
import LandingPage from '../LandingPage/LandingPage'
import FAQ from '../LandingPage/FAQ'
import TopBar from '../TopBar'
import InvoiceTools from '../InvoiceTools'
import InvoiceDetail from '../InvoiceDetail'
import AccountSettings from '../AccountSettings'
import {Footer} from '../helpers/idsk'
import mfsrLogo from '../helpers/mfsrLogo'
import fsLogo from '../helpers/fsLogo'
import {AuthRoute} from '../helpers/Auth'
import LoadingModal from '../helpers/LoadingModal'
import NotFound from '../helpers/NotFound'
import InvoiceDocumentation from '../InvoiceDocumentation'
import {isLoadingSelector} from '../helpers/state'
import {isLoggingSelector} from '../cache/users/state'
import {getMyInfo} from '../cache/users/actions'
import Goals from '../LandingPage/Goals'
import Phases from '../LandingPage/Phases'
import Public from '../LandingPage/Public'
import Workflow from '../LandingPage/Workflow'

// Load slovak translations for time
registerLocale('sk', sk)

export default () => {
  const {i18n} = useTranslation('common')
  const isLoading = useSelector(isLoadingSelector)
  const isLogging = useSelector(isLoggingSelector)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getMyInfo())
  }, [dispatch])

  const footerProps = useMemo(
    () => ({
      logos: [{
        href: 'https://mfsr.sk',
        src: mfsrLogo[i18n.language],
      }, {
        href: 'https://www.financnasprava.sk',
        src: fsLogo[i18n.language],
      }],
    }),
    [i18n.language],
  )

  if (isLogging) {
    return <LoadingModal />
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
      <TopBar />
      <main>
        <Switch>
          <Route exact path="/">
            <Suspense fallback={<LoadingModal />}>
              <LandingPage />
            </Suspense>
          </Route>
          <Route exact path="/faq">
            <Suspense fallback={<LoadingModal />}>
              <FAQ />
            </Suspense>
          </Route>
          <Route exact path="/goals" component={Goals} />
          <Route exact path="/phases" component={Phases} />
          <Route exact path="/public" component={Public} />
          <Route exact path="/workflow" component={Workflow} />
          <AuthRoute exact path="/account">
            <AccountSettings />
          </AuthRoute>
          <AuthRoute exact path="/my-invoices">
            <MyInvoices />
          </AuthRoute>
          <Redirect exact from="/invoice-tools" to="/invoice-tools/form" />
          <Route path="/invoice-tools" component={InvoiceTools} />
          <Route exact path="/invoices" component={PublicInvoices} />
          <Route exact path="/invoices/:id" component={InvoiceDetail} />
          <Route path="/invoiceDocumentation" component={InvoiceDocumentation} />
          <Route component={NotFound} />
        </Switch>
      </main>
      {isLoading && <LoadingModal />}
      <Footer {...footerProps} />
    </div>
  )
}
