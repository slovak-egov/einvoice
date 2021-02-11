import {NavLink, Route, Switch} from 'react-router-dom'
import {Button} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'
import InvoiceSubmission from './InvoiceSubmission'
import InvoiceVisualization from './Visualization'

export default () => {
  const {t} = useTranslation('common')
  return (
    <div className="m-1">
      <div className="row justify-content-center">
        <NavLink to="/create-invoice/visualization" activeClassName="selected">
          <Button variant="primary" size="lg">{t('visualization')}</Button>
        </NavLink>
        <NavLink to="/create-invoice/submission" activeClassName="selected">
          <Button variant="primary" size="lg">{t('submission')}</Button>
        </NavLink>
      </div>
      <Switch>
        <Route path="/create-invoice/submission" component={InvoiceSubmission} />
        <Route path="/create-invoice/visualization" component={InvoiceVisualization} />
      </Switch>
    </div>
  )
}
