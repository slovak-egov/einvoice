import 'bootstrap/dist/css/bootstrap.css'
import '@fortawesome/fontawesome-free/css/all.css'
import React, {useEffect} from 'react'
import {useDispatch} from 'react-redux'
import {Route, Switch} from 'react-router-dom'
import {Spinner} from 'react-bootstrap'
import App from './App'
import LoadingModal from './helpers/LoadingModal'
import {loginWithSlovenskoSkToken, logout} from '../actions/users'

const LoginCallback = ({history, location}) => {
  const dispatch = useDispatch()

  useEffect(() => {
    (async () => {
      const urlParams = new URLSearchParams(location.search)
      if (await dispatch(loginWithSlovenskoSkToken(urlParams.get('token')))) {
        history.push('/account')
      } else {
        history.push('/')
      }
    })()
  })

  return <LoadingModal />
}

const LogoutCallback = ({history}) => {
  const dispatch = useDispatch()

  useEffect(() => {
    (async () => {
      await dispatch(logout())
      history.push('/')
    })()
  })

  return <LoadingModal />
}

const CenteredSpinner = () => (
  <div className="Modal">
    <Spinner animation="border" variant="primary" />
  </div>
)

export default () => (
  <Switch>
    <Route path="/login-callback" component={LoginCallback} />
    <Route path="/logout-callback" component={LogoutCallback} />
    <Route>
      <React.Suspense fallback={<CenteredSpinner />}>
        <App />
      </React.Suspense>
    </Route>
  </Switch>
)
