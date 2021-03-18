import {useSelector} from 'react-redux'
import {NavLink, Route, Switch} from 'react-router-dom'
import {Button} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'
import InvoiceSubmission from './InvoiceSubmission'
import Form from './form'
import Drafts from './drafts'
import {AuthRoute} from '../helpers/Auth'
import {isUserLogged} from '../cache/users/state'

export default ({match}) => {
  const {t} = useTranslation('common')
  const isLogged = useSelector(isUserLogged)
  const title = isLogged ? 'submission' : 'visualization'
  return (
    <div className="m-1">
      <div className="row justify-content-center">
        {isLogged && <NavLink to={`${match.url}/drafts`} activeClassName="selected">
          <Button variant="primary" size="lg">{t('drafts')}</Button>
        </NavLink>}
        <NavLink to={`${match.url}/form`} activeClassName="selected">
          <Button variant="primary" size="lg">{t('form')}</Button>
        </NavLink>
        <NavLink to={`${match.url}/submission`} activeClassName="selected">
          <Button variant="primary" size="lg">{t(title)}</Button>
        </NavLink>
      </div>
      <Switch>
        <AuthRoute path={`${match.url}/drafts`}>
          <Drafts />
        </AuthRoute>
        <Route path={`${match.url}/form`} component={Form} />
        <Route path={`${match.url}/submission`}>
          <InvoiceSubmission showSubmission={isLogged} title={title} />
        </Route>
      </Switch>
    </div>
  )
}
