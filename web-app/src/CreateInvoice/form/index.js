import {useCallback, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {Button, Card, Form} from 'react-bootstrap'
import TagGroup from './TagGroup'
import {formTypeSelector, isInvoiceFormInitialized, invoiceFormSelector} from './state'
import {initializeFormState, setFormType, submitInvoiceForm} from './actions'
import {
  areCodeListsLoadedSelector, isUblXsdDocsLoadedSelector, ubl21XsdDocsSelector,
} from '../../cache/documentation/state'
import {getCodeLists, getUblXsdDocs} from '../../cache/documentation/actions'
import {invoiceTypes} from '../../utils/constants'

export default ({match}) => {
  const {t} = useTranslation('common')
  const history = useHistory()
  const isDocsLoaded = useSelector(isUblXsdDocsLoadedSelector)
  const areCodeListsLoaded = useSelector(areCodeListsLoadedSelector)
  const isInvoiceFormLoaded = useSelector(isInvoiceFormInitialized)
  const invoiceDocs = useSelector(ubl21XsdDocsSelector)
  const invoiceForm = useSelector(invoiceFormSelector)
  const formType = useSelector(formTypeSelector)
  const dispatch = useDispatch()

  // We need to have separate useEffects, so requests can be done in parallel
  useEffect(() => {
    if (!isDocsLoaded) {
      dispatch(getUblXsdDocs())
    }
  }, [dispatch, isDocsLoaded])

  useEffect(() => {
    if (!areCodeListsLoaded) {
      dispatch(getCodeLists())
    }
  }, [areCodeListsLoaded, dispatch])

  useEffect(() => {
    if (areCodeListsLoaded && isDocsLoaded && !isInvoiceFormLoaded) {
      dispatch(initializeFormState())
    }
  }, [areCodeListsLoaded, dispatch, isDocsLoaded, isInvoiceFormLoaded])

  const changeFormType = useCallback(
    (e) => dispatch(setFormType(e.target.value)), [dispatch]
  )

  const resetForm = useCallback(
    () => dispatch(initializeFormState()), [dispatch],
  )

  const submit = useCallback(
    async () => {
      await dispatch(submitInvoiceForm())
      const parentUrl = match.url.split('/').slice(0, -1).join('/')
      history.push(`${parentUrl}/submission`)
    }, [dispatch, match.url])

  // Data is loading
  if (!isInvoiceFormLoaded) return null

  return (
    <Card className="m-1">
      <Card.Header className="bg-primary text-white text-center" as="h3" style={{display: 'grid'}}>
        <Form.Control
          as="select"
          style={{gridRowStart: 1, gridColumnStart: 1, justifySelf: 'left'}}
          className="w-auto"
          value={formType}
          onChange={changeFormType}
        >
          {Object.values(invoiceTypes).map((type) => (
            <option key={type} value={type}>{t(`invoiceTypes.${type}`)}</option>
          ))}
        </Form.Control>
        <div style={{gridRowStart: 1, gridColumnStart: 1, justifySelf: 'center'}}>
          {t('form')}
        </div>
        <Button
          variant="danger"
          style={{gridRowStart: 1, gridColumnStart: 1, justifySelf: 'right'}}
          onClick={resetForm}
        >
          {t('reset')}
        </Button>
      </Card.Header>
      <Card.Body>
        {formType === invoiceTypes.INVOICE ? <>
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
        </> : <div>Coming soon</div>
        }
      </Card.Body>
    </Card>
  )
}
