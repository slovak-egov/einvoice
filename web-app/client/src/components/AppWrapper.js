import 'bootstrap/dist/css/bootstrap.css'
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {lifecycle} from 'recompose'
import {Route, Switch} from 'react-router-dom'
import App from './App'
import LoadingModal from './helpers/LoadingModal'
import {loginWithSlovenskoSkToken} from '../actions/users'

const LoginCallback = compose(
  connect(
    null,
    {loginWithSlovenskoSkToken}
  ),
  lifecycle({
    async componentDidMount() {
      const urlParams = new URLSearchParams(this.props.location.search)
      if (await this.props.loginWithSlovenskoSkToken(urlParams.get('token'))) {
        this.props.history.push('/account')
      } else {
        this.props.history.push('/')
      }
    },
  })
)(LoadingModal)

export default () => (
  <Switch>
    <Route path="/login-callback" component={LoginCallback} />
    <Route component={App} />
  </Switch>
)
