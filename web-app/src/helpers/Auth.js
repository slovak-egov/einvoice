import {useSelector} from 'react-redux'
import {Route} from 'react-router-dom'
import Unauthorized from './Unauthorized'
import {isUserLogged} from '../cache/users/state'

const Auth = ({children}) => {
  const isLogged = useSelector(isUserLogged)

  return isLogged ? children : <Unauthorized />
}

export const AuthRoute = ({children, ...otherProps}) => (
  <Route {...otherProps}>
    <Auth>
      {children}
    </Auth>
  </Route>
)
