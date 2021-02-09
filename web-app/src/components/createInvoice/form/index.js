import {useCallback, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {Button, Card} from 'react-bootstrap'
import TagGroup from './TagGroup'
import {areCodeListsLoadedSelector, isUblDocsLoadedSelector, ubl21DocsSelector} from '../../../state/docs'
import {isFormInitialized, invoiceFormSelector} from '../../../state/invoiceForm'
import {getCodeLists, getUblDocs} from '../../../actions/docs'
import {initializeFormState, submitInvoiceForm} from '../../../actions/invoiceForm'

export default ({match}) => {
  const {t} = useTranslation('common')
  const history = useHistory()
  const isDocsLoaded = useSelector(isUblDocsLoadedSelector)
  const areCodeListsLoaded = useSelector(areCodeListsLoadedSelector)
  const isFormLoaded = useSelector(isFormInitialized)
  const invoiceDocs = useSelector(ubl21DocsSelector)
  const invoiceForm = useSelector(invoiceFormSelector)
  const dispatch = useDispatch()

  // We need to have separate useEffects, so requests can be done in parallel
  useEffect(() => {
    if (!isDocsLoaded) {
      dispatch(getUblDocs())
    }
  }, [dispatch, isDocsLoaded])

  useEffect(() => {
    if (!areCodeListsLoaded) {
      dispatch(getCodeLists())
    }
  }, [areCodeListsLoaded, dispatch])

  useEffect(() => {
    if (areCodeListsLoaded && isDocsLoaded && !isFormLoaded) {
      dispatch(initializeFormState())
    }
  }, [areCodeListsLoaded, dispatch, isDocsLoaded, isFormLoaded])

  const submit = useCallback(
    async () => {
      await dispatch(submitInvoiceForm())
      const parentUrl = match.url.split('/').slice(0, -1).join('/')
      history.push(`${parentUrl}/submission`)
    }, [dispatch, match])

  // Data is loading
  if (!isFormLoaded) return null

  return (
    <Card className="m-1">
      <Card.Header className="bg-primary text-white text-center" as="h3">
        {t('form')}
      </Card.Header>
      <Card.Body>
        <TagGroup
          path={['ubl:Invoice']}
          formData={invoiceForm['ubl:Invoice']}
          docs={invoiceDocs['ubl:Invoice']}
        />
        <div className="d-flex mt-1">
          <Button variant="primary" className="ml-auto" onClick={submit}>
            {t('generateInvoice')}
          </Button>
        </div>
      </Card.Body>
    </Card>
  )
}
