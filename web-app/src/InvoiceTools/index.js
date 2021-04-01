import {useMemo} from 'react'
import {useSelector} from 'react-redux'
import {Route, Switch} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import InvoiceSubmission from './InvoiceSubmission'
import Form from './form'
import Drafts from './drafts'
import {AuthRoute} from '../helpers/Auth'
import {isUserLogged} from '../cache/users/state'
import {Tabs} from '../helpers/idsk'

export default ({match}) => {
  const {i18n, t} = useTranslation('common')
  const isLogged = useSelector(isUserLogged)
  const title = isLogged ? 'submission' : 'visualization'
  const tabs = useMemo(
    () => [
      ...(isLogged ? [{to: `${match.url}/drafts`, label: t('drafts')}] : []),
      {to: `${match.url}/form`, label: t('form')},
      {to: `${match.url}/submission`, label: t(title)},
    ],
    [isLogged, i18n.language],
  )

  return (
    <div className="m-2">
      <Tabs tabs={tabs}>
        <Switch>
          <AuthRoute path={`${match.url}/drafts`}>
            <Drafts />
          </AuthRoute>
          <Route path={`${match.url}/form`} component={Form} />
          <Route path={`${match.url}/submission`}>
            <InvoiceSubmission showSubmission={isLogged} title={title} />
          </Route>
        </Switch>
      </Tabs>
    </div>
  )
}
