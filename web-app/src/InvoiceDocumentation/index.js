import {Link, Route, Switch, useLocation} from 'react-router-dom'
import {Breadcrumb} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'
import Syntax from './ubl2.1/syntax'
import BusinessTerms from './businessTerms'
import Home from './Home'
import CodeLists from './codeLists'
import Rules from './ubl2.1/rules'

const UrlBreadcrumbItems = () => {
  const {t} = useTranslation('common')
  const location = useLocation()

  let currentPrefix = ''
  const urlParts = location.pathname.slice(1).split('/')

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
        {i > 1 ? part : t(`invoiceDocs.${part}`)}
      </Breadcrumb.Item>
    )
  }
  return result
}

export default ({match}) => (
  <div className="m-1">
    <Breadcrumb>
      <UrlBreadcrumbItems />
    </Breadcrumb>
    <Switch>
      <Route path={`${match.url}/ublInvoice`} component={Syntax} />
      <Route path={`${match.url}/ublCreditNote`} component={Syntax} />
      <Route path={`${match.url}/businessTerms`} component={BusinessTerms} />
      <Route path={`${match.url}/codeLists`} component={CodeLists} />
      <Route path={`${match.url}/ublRules`} component={Rules} />
      <Route component={Home} />
    </Switch>
  </div>
)
