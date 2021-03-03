import './App.css'
import {Suspense, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Redirect, Route, Switch} from 'react-router-dom'
import {registerLocale} from 'react-datepicker'
import sk from 'date-fns/locale/sk'
import PublicInvoices from '../PublicInvoices'
import MyInvoices from '../MyInvoices'
import LandingPage from '../LandingPage'
import FAQ from '../LandingPage/FAQ'
import TopBar from '../TopBar'
import Footer from '../Footer'
import CreateInvoice from '../CreateInvoice'
import InvoiceDetail from '../InvoiceDetail'
import AccountSettings from '../AccountSettings'
import {AuthRoute} from '../helpers/Auth'
import LoadingModal from '../helpers/LoadingModal'
import NotFound from '../helpers/NotFound'
import InvoiceDocumentation from '../InvoiceDocumentation'
import {isLoadingSelector} from '../helpers/state'
import {isLoggingSelector} from '../cache/users/state'
import {getMyInfo} from '../cache/users/actions'

// Load slovak translations for time
registerLocale('sk', sk)

export default () => {
  const isLoading = useSelector(isLoadingSelector)
  const isLogging = useSelector(isLoggingSelector)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getMyInfo())
  }, [dispatch])

  if (isLogging) {
    return <LoadingModal />
  }

  return (
    <div className="d-flex min-vh-100 flex-column">
      <TopBar />
      <div className="container">
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
          <AuthRoute exact path="/account">
            <AccountSettings />
          </AuthRoute>
          <AuthRoute exact path="/my-invoices">
            <MyInvoices />
          </AuthRoute>
          <Redirect exact from="/invoice-tools" to="/invoice-tools/form" />
          <Route path="/invoice-tools" component={CreateInvoice} />
          <Route exact path="/invoices" component={PublicInvoices} />
          <Route exact path="/invoices/:id([0-9]+)" component={InvoiceDetail} />
          <Route path="/invoice-documentation" component={InvoiceDocumentation} />
          <Route component={NotFound} />
        </Switch>
      </div>
      {isLoading && <LoadingModal />}
      <Footer />
    </div>
  )
}
