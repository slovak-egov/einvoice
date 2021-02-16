import {useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Link, Route, Switch} from 'react-router-dom'
import {Card, ListGroup} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'
import CodeList from './CodeList'
import {areCodeListsLoadedSelector, codeListsSelector} from '../../state/docs'
import {getCodeLists} from '../../actions/docs'

const Home = ({codeLists}) => {
  const {t} = useTranslation('common')
  return (
    <Card>
      <Card.Header className="bg-primary text-white text-center" as="h3">
        {t('invoiceDocs.codeLists')}
      </Card.Header>
      <Card.Body>
        <ListGroup>
          {Object.keys(codeLists).map((codeList, index) => (
            <ListGroup.Item key={index} as={Link} to={`/invoice-documentation/codeLists/${codeList}`} action>
              {codeList}
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
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
