import {useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Link, Route, Switch} from 'react-router-dom'
import {Card, Table} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'
import BusinessTerm from './BusinessTerm'
import {businessTermsDocsSelector, isBusinessTermsDocsLoadedSelector} from '../../cache/documentation/state'
import {getBusinessTermsDocs} from '../../cache/documentation/actions'
import {displayCardinality} from '../ubl2.1/syntax/helpers'

const Home = ({businessTerms}) => {
  const {i18n, t} = useTranslation('common')
  return (
    <Card>
      <Card.Header className="bg-primary text-white text-center" as="h3">
        {t('invoiceDocs.businessTerms')}
      </Card.Header>
      <Card.Body>
        <Table striped hover responsive size="sm">
          <thead>
            <tr>
              <th style={{width: '5%'}}>{t('invoiceDocs.cardinality.short')}</th>
              <th className="w-25">ID</th>
              <th className="d-none d-sm-table-cell">{t('invoiceDocs.description')}</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(businessTerms).map(([id, term]) => (
              <tr key={id}>
                <td style={{width: '5%'}}>{displayCardinality(term.cardinality)}</td>
                <td className="w-25">
                  <span>{'• '.repeat(term.level)}</span>
                  <Link to={`/invoiceDocumentation/businessTerms/${id}`}>{id}</Link>
                </td>
                <td className="d-none d-sm-table-cell">
                  <strong>{term.name[i18n.language]}</strong>
                  <div>{term.description[i18n.language]}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  )
}

export default ({match}) => {
  const isLoaded = useSelector(isBusinessTermsDocsLoadedSelector)
  const dispatch = useDispatch()

  useEffect(() => {
    if (!isLoaded) {
      dispatch(getBusinessTermsDocs())
    }
  }, [dispatch, isLoaded])

  const businessTerms = useSelector(businessTermsDocsSelector)

  // Data is loading
  if (!isLoaded) return null

  return (
    <Switch>
      <Route path={`${match.url}/:id`}>
        {({match}) => (
          <BusinessTerm data={businessTerms[match.params.id]} id={match.params.id} />
        )}
      </Route>
      <Route>
        <Home businessTerms={businessTerms} />
      </Route>
    </Switch>
  )
}
