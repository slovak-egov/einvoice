import './App.css'
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {branch, lifecycle, renderComponent} from 'recompose'
import {Route, Switch} from 'react-router-dom'
import AllInvoices from './AllInvoices'
import MyInvoices from './MyInvoices'
import LandingPage from './landingPage'
import TopBar from './TopBar'
import CreateInvoice from './CreateInvoice'
import InvoiceView from './InvoiceView'
import AccountSettings from './AccountSettings'
import {getMyInfo} from '../actions/users'
import LoadingModal from './helpers/LoadingModal'
import NotFound from './helpers/NotFound'
import {isLogged} from '../state/users'

const App = ({isLoading}) => (
  <React.Fragment>
    <TopBar />
    <div className="container">
      <Switch>
        <Route exact path="/" component={LandingPage} />
        <Route exact path="/account" component={AccountSettings} />
        <Route exact path="/my-invoices" component={MyInvoices} />
        <Route exact path="/create-invoice" component={CreateInvoice} />
        <Route exact path="/invoices" component={AllInvoices} />
        <Route exact path="/invoices/:id([0-9]+)" component={InvoiceView} />
        <Route component={NotFound} />
      </Switch>
    </div>
    {isLoading && <LoadingModal />}
  </React.Fragment>
)

export default compose(
  connect(
    (state) => ({
      isLoading: state.loadingRequests > 0,
      isLogging: state.logging,
      isLogged: isLogged(state),
    }),
    {getMyInfo}
  ),
  lifecycle({
    async componentDidMount() {
      // try to get user only if not already logged
      if (!this.props.isLogged) {
        await this.props.getMyInfo()
      }
    },
  }),
  branch(
    ({isLogging}) => isLogging,
    renderComponent(LoadingModal),
  ),
)(App)
