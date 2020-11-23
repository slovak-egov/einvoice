import {compose} from 'redux'
import {connect} from 'react-redux'
import {branch, renderComponent} from 'recompose'
import Unauthorized from './Unauthorized'
import {isLogged} from '../../state/users'

export default compose(
  connect(
    (state) => ({
      isLogged: isLogged(state),
    })
  ),
  branch(
    ({isLogged}) => !isLogged,
    renderComponent(Unauthorized),
  ),
)
