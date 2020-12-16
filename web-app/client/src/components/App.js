import './App.css'
import {useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Route, Switch} from 'react-router-dom'
import PublicInvoices from './PublicInvoices'
import MyInvoices from './MyInvoices'
import LandingPage from './landingPage'
import FAQ from './landingPage/FAQ'
import TopBar from './TopBar'
import Footer from './Footer'
import CreateInvoice from './CreateInvoice'
import InvoiceView from './InvoiceView'
import AccountSettings from './AccountSettings'
import {getMyInfo} from '../actions/users'
import {AuthRoute} from './helpers/Auth'
import LoadingModal from './helpers/LoadingModal'
import NotFound from './helpers/NotFound'
import {isLoadingSelector, isLoggingSelector} from '../state/common'

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
          <Route exact path="/" component={LandingPage} />
          <Route exact path="/faq" component={FAQ} />
          <AuthRoute exact path="/account">
            <AccountSettings />
          </AuthRoute>
          <AuthRoute exact path="/my-invoices">
            <MyInvoices />
          </AuthRoute>
          <AuthRoute exact path="/create-invoice">
            <CreateInvoice />
          </AuthRoute>
          <Route exact path="/invoices" component={PublicInvoices} />
          <Route exact path="/invoices/:id([0-9]+)" component={InvoiceView} />
          <Route component={NotFound} />
        </Switch>
      </div>
      {isLoading && <LoadingModal />}
      <Footer />
    </div>
  )
}
