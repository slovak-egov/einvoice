import {useMemo} from 'react'
import {Route, Switch} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {Breadcrumb} from '../helpers/idsk'
import Syntax from './ubl2.1/syntax'
import BusinessTerms from './businessTerms'
import FormValidations from './formValidations'
import Home from './Home'
import CodeLists from './codeLists'
import Rules from './ubl2.1/rules'

const getBreadcrumbItems = ({t, pathname}) => {
  let currentPrefix = ''
  const result = []
  const urlParts = pathname.slice(1).split('/')

  for (const [i, part] of urlParts.entries()) {
    currentPrefix = `${currentPrefix}/${part}`
    result.push({
      children: i > 1 ? part : t(`invoiceDocs.${part}`),
      to: i !== urlParts.length - 1 && currentPrefix,
    })
  }

  return result
}

export default ({location, match}) => {
  const {t} = useTranslation('common')
  const breadcrumbItems = useMemo(
    () => getBreadcrumbItems({t, pathname: location.pathname}),
    [location.pathname, t],
  )

  return (
    <div className="govuk-main-wrapper container">
      <Breadcrumb
        collapseOnMobile
        items={breadcrumbItems}
      />
      <Switch>
        <Route path={`${match.url}/ublInvoice`} component={Syntax} />
        <Route path={`${match.url}/ublCreditNote`} component={Syntax} />
        <Route path={`${match.url}/businessTerms`} component={BusinessTerms} />
        <Route path={`${match.url}/codeLists`} component={CodeLists} />
        <Route path={`${match.url}/ublRules`} component={Rules} />
        <Route path={`${match.url}/formValidations`} component={FormValidations} />
        <Route component={Home} />
      </Switch>
    </div>
  )
}
