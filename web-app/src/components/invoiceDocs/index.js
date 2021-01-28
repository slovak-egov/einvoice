import {Link, Redirect, Route, Switch, useLocation, useRouteMatch} from 'react-router-dom'
import {Breadcrumb} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'
import Tag from './Tag'
import Home from './Home'

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
  // Temporarily redirect to root element docs
  if (location.pathname === `${match.url}/syntax`) {
    return <Redirect to={`${match.url}/syntax/ubl:Invoice`} />
  }
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
        <Route path={`${match.url}/syntax`} component={Tag} />
        <Route component={Home} />
      </Switch>
    </div>
  )
}
