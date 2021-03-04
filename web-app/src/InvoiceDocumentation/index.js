import {Link, Route, Switch, useLocation, useRouteMatch} from 'react-router-dom'
import {Breadcrumb} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'
import Syntax from './ubl2.1/syntax'
import Home from './Home'
import CodeLists from './codeLists'
import Rules from './ubl2.1/rules'

const UrlBreadcrumbItems = () => {
  const {t} = useTranslation('common')
  const location = useLocation()
  const match = useRouteMatch()

  let currentPrefix = match.url
  const urlParts = location.pathname.split('/').slice(2)

  const result = []
  for (const [i, part] of urlParts.entries()) {
    currentPrefix = `${currentPrefix}/${part}`
    result.push(
      <Breadcrumb.Item
        key={i}
        linkAs={Link}
        linkProps={{to: currentPrefix}}
        active={i === urlParts.length - 1}
      >
        {i > 0 ? part : t(`invoiceDocs.${part}`)}
      </Breadcrumb.Item>
    )
  }
  return result
}

export default ({location, match}) => {
  const {t} = useTranslation('common')

  return (
    <div className="m-1">
      <Breadcrumb>
        <Breadcrumb.Item
          linkAs={Link}
          linkProps={{to: match.url}}
          active={location.pathname === match.url}
        >
          {t('invoiceDocs.home')}
        </Breadcrumb.Item>
        <UrlBreadcrumbItems />
      </Breadcrumb>
      <Switch>
        <Route path={`${match.url}/ublInvoice`} component={Syntax} />
        <Route path={`${match.url}/ublCreditNote`} component={Syntax} />
        <Route path={`${match.url}/codeLists`} component={CodeLists} />
        <Route path={`${match.url}/ublRules`} component={Rules} />
        <Route component={Home} />
      </Switch>
    </div>
  )
}
