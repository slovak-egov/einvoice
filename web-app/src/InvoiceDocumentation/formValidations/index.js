import {useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Link, Route, Switch} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {Table} from '../../helpers/idsk'

import {
  areCodeListsLoadedSelector,
  areFormValidationDocsLoadedSelector,
  businessTermsDocsSelector,
  codeListsSelector,
  formValidationDocsSelector,
  isBusinessTermsDocsLoadedSelector,
} from '../../cache/documentation/state'
import {getBusinessTermsDocs, getCodeLists, getFormValidationDocs} from '../../cache/documentation/actions'
import Validation from './Validation'
import {businessTermLink} from '../../helpers/businessTerms'

const Home = ({match, validations, businessTerms}) => {
  const {i18n, t} = useTranslation('common')

  return (
    <>
      <h1 className="govuk-heading-l">{t('invoiceDocs.validations.title')}</h1>
      <Table
        head={[
          {children: t('invoiceDocs.validations.identifier')},
          {children: t('invoiceDocs.validations.businessTerm')},
          {children: t('invoiceDocs.validations.businessTermName')},
          {children: t('invoiceDocs.validations.description')},
        ]}
        rows={Object.entries(validations).map(([id, rule]) => [
          {
            children: <Link to={`${match.url}/${id}`}>{id}</Link>,
            style: {width: '5%'},
          },
          {
            children: businessTermLink(rule.businessTerm),
            style: {width: '16%'},
          },
          {
            children: businessTerms[rule.businessTerm].name[i18n.language],
            style: {width: '30%'},
          },
          {
            children: rule.description ?
              rule.description[i18n.language] : rule.message[i18n.language],
          },
        ])}
      />
    </>
  )
}

export default ({match}) => {
  const isValidationLoaded = useSelector(areFormValidationDocsLoadedSelector)
  const areCodeListsLoaded = useSelector(areCodeListsLoadedSelector)
  const isBusinessTermsDocLoaded = useSelector(isBusinessTermsDocsLoadedSelector)
  const dispatch = useDispatch()

  useEffect(() => {
    if (!isValidationLoaded) {
      dispatch(getFormValidationDocs())
    }
  }, [dispatch, isValidationLoaded])

  useEffect(() => {
    if (!isBusinessTermsDocLoaded) {
      dispatch(getBusinessTermsDocs())
    }
  }, [dispatch, isBusinessTermsDocLoaded])

  useEffect(() => {
    if (!areCodeListsLoaded) {
      dispatch(getCodeLists())
    }
  }, [dispatch, areCodeListsLoaded])

  const validations = useSelector(formValidationDocsSelector)
  const businessTerms = useSelector(businessTermsDocsSelector)
  const codeLists = useSelector(codeListsSelector)

  // Data is loading
  if (!isValidationLoaded || !isBusinessTermsDocLoaded || !areCodeListsLoaded) return null

  return (
    <Switch>
      <Route path={`${match.url}/:id`}>
        {({match}) => (
          <Validation
            rule={validations[match.params.id]}
            id={match.params.id}
            businessTerms={businessTerms}
            codeLists={codeLists}
          />
        )}
      </Route>
      <Route>
        <Home validations={validations} match={match} businessTerms={businessTerms} />
      </Route>
    </Switch>
  )
}
