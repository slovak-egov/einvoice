import {useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Route, Switch} from 'react-router-dom'
import Overview from './Overview'
import Rule from './Rule'
import {isUblRulesDocsLoadedSelector} from '../../../cache/documentation/state'
import {getUblRulesDocs} from '../../../cache/documentation/actions'

export default ({match}) => {
  const isLoaded = useSelector(isUblRulesDocsLoadedSelector)
  const dispatch = useDispatch()

  useEffect(() => {
    if (!isLoaded) {
      dispatch(getUblRulesDocs())
    }
  }, [dispatch, isLoaded])

  // Data is loading
  if (!isLoaded) return null

  return (
    <Switch>
      <Route path={`${match.url}/:id`} component={Rule} />
      <Route component={Overview} />
    </Switch>
  )
}
