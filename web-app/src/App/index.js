import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-free/css/all.css'
import {Suspense, useEffect} from 'react'
import {useDispatch} from 'react-redux'
import {Route, Switch} from 'react-router-dom'
import {Spinner} from 'react-bootstrap'
import App from './App'
import {login, logout} from '../cache/users/actions'

const CenteredSpinner = () => (
  <div className="position-fixed" style={{top: '50%', left: '50%'}}>
    <Spinner animation="border" variant="primary" />
  </div>
)

const LoginCallback = ({history, location}) => {
  const dispatch = useDispatch()

  useEffect(() => {
    (async () => {
      const urlParams = new URLSearchParams(location.search)
      if (await dispatch(login(urlParams.get('token')))) {
        history.push('/account')
      } else {
        history.push('/')
      }
    })()
  })

  return <CenteredSpinner />
}

const LogoutCallback = ({history}) => {
  const dispatch = useDispatch()

  useEffect(() => {
    (async () => {
      if (localStorage.getItem('sessionToken')) {
        await dispatch(logout())
      }
      history.push('/')
    })()
  })

  return <CenteredSpinner />
}

export default () => (
  <Switch>
    <Route path="/login-callback" component={LoginCallback} />
    <Route path="/logout-callback" component={LogoutCallback} />
    <Route>
      <Suspense fallback={<CenteredSpinner />}>
        <App />
      </Suspense>
    </Route>
  </Switch>
)
