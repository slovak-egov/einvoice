import {useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Route, Switch} from 'react-router-dom'
import UblInvoice from './UblInvoice'
import Tag from './Tag'
import {isUblXsdDocsLoadedSelector} from '../../../cache/documentation/state'
import {getUblXsdDocs} from '../../../cache/documentation/actions'

export default ({match}) => {
  const isLoaded = useSelector(isUblXsdDocsLoadedSelector)
  const dispatch = useDispatch()

  useEffect(() => {
    if (!isLoaded) {
      dispatch(getUblXsdDocs())
    }
  }, [dispatch, isLoaded])

  // Data is loading
  if (!isLoaded) return null

  return (
    <Switch>
      <Route exact path={match.url} component={UblInvoice} />
      <Route component={Tag} />
    </Switch>
  )
}
