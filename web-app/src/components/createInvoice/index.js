import {NavLink, Route, Switch, useRouteMatch} from 'react-router-dom'
import {Button} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'
import InvoiceSubmission from './InvoiceSubmission'
import Form from './form'

export default ({showSubmission}) => {
  const {t} = useTranslation('common')
  const match = useRouteMatch()
  return (
    <div className="m-1">
      <div className="row justify-content-center">
        <NavLink to={`${match.url}/form`} activeClassName="selected">
          <Button variant="primary" size="lg">{t('form')}</Button>
        </NavLink>
        <NavLink to={`${match.url}/submission`} activeClassName="selected">
          <Button variant="primary" size="lg">{t('submission')}</Button>
        </NavLink>
      </div>
      <Switch>
        <Route path={`${match.url}/form`} component={Form} />
        <Route path={`${match.url}/submission`}>
          <InvoiceSubmission showSubmission={showSubmission} />
        </Route>
      </Switch>
    </div>
  )
}
