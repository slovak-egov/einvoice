import {useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Link, Route, Switch} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {Table} from '../../helpers/idsk'
import BusinessTerm from './BusinessTerm'
import {businessTermsDocsSelector, isBusinessTermsDocsLoadedSelector} from '../../cache/documentation/state'
import {getBusinessTermsDocs} from '../../cache/documentation/actions'
import {displayCardinality} from '../ubl2.1/syntax/helpers'

const Home = ({businessTerms}) => {
  const {i18n, t} = useTranslation('common')
  return (
    <>
      <h1 className="govuk-heading-l">{t('invoiceDocs.businessTerms')}</h1>
      <Table
        head={[
          {children: t('invoiceDocs.cardinality.short')},
          {children: 'ID'},
          {
            children: t('invoiceDocs.description'),
            className: 'd-none-mobile',
          },
        ]}
        rows={Object.entries(businessTerms).map(([id, term]) => [
          {
            children: displayCardinality(term.cardinality),
            style: {width: '5%'},
          },
          {
            children: (
              <>
                <span>{'• '.repeat(term.level)}</span>
                <Link to={`/invoiceDocumentation/businessTerms/${id}`}>{id}</Link>
              </>
            ),
            style: {width: '15%'},
          },
          {
            children: (
              <>
                <strong>{term.name[i18n.language]}</strong>
                <div>{term.description[i18n.language]}</div>
              </>
            ),
            className: 'd-none-mobile',
          },
        ])}
      />
    </>
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
