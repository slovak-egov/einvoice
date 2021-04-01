import {useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Route, Switch} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {CrossRoads} from '../../helpers/idsk'
import CodeList from './CodeList'
import {areCodeListsLoadedSelector, codeListsSelector} from '../../cache/documentation/state'
import {getCodeLists} from '../../cache/documentation/actions'

const Home = ({codeLists}) => {
  const {t} = useTranslation('common')
  return (
    <>
      <h1 className="govuk-heading-l">{t('invoiceDocs.codeLists')}</h1>
      <CrossRoads
        items={Object.keys(codeLists).map((codeList) => ({
          title: codeList,
          to: `/invoiceDocumentation/codeLists/${codeList}`,
        }))}
      />
    </>
  )
}

export default ({match}) => {
  const isLoaded = useSelector(areCodeListsLoadedSelector)
  const dispatch = useDispatch()

  useEffect(() => {
    if (!isLoaded) {
      dispatch(getCodeLists())
    }
  }, [dispatch, isLoaded])

  const codeLists = useSelector(codeListsSelector)

  // Data is loading
  if (!isLoaded) return null

  return (
    <Switch>
      <Route path={`${match.url}/:id`}>
        {({match}) => <CodeList data={codeLists[match.params.id]} identifier={match.params.id} />}
      </Route>
      <Route>
        <Home codeLists={codeLists} />
      </Route>
    </Switch>
  )
}
