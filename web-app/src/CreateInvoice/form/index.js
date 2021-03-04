import {useCallback, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {Button, Card, Col, Form, Row} from 'react-bootstrap'
import TagGroup from './TagGroup'
import {formTypeSelector, isInvoiceFormInitialized, invoiceFormSelector} from './state'
import {initializeFormState, setFormType, submitInvoiceForm} from './actions'
import {
  areCodeListsLoadedSelector, isUblInvoiceDocsLoadedSelector, ublInvoiceDocsSelector,
} from '../../cache/documentation/state'
import {getCodeLists, getUblInvoiceDocs} from '../../cache/documentation/actions'
import {invoiceTypes} from '../../utils/constants'

export default ({match}) => {
  const {t} = useTranslation('common')
  const history = useHistory()
  const isDocsLoaded = useSelector(isUblInvoiceDocsLoadedSelector)
  const areCodeListsLoaded = useSelector(areCodeListsLoadedSelector)
  const isInvoiceFormLoaded = useSelector(isInvoiceFormInitialized)
  const invoiceDocs = useSelector(ublInvoiceDocsSelector)
  const invoiceForm = useSelector(invoiceFormSelector)
  const formType = useSelector(formTypeSelector)
  const dispatch = useDispatch()

  const [errorCount, setErrorCount] = useState(0)

  // We need to have separate useEffects, so requests can be done in parallel
  useEffect(() => {
    if (!isDocsLoaded) {
      dispatch(getUblInvoiceDocs())
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
      <Card.Header className="bg-primary text-white text-center" as="h3">
        <Row className="d-block d-sm-none">{t('form')}</Row>
        <Row className="mb-0">
          <Col>
            <Form.Control
              as="select"
              className="w-auto"
              value={formType}
              onChange={changeFormType}
            >
              {Object.values(invoiceTypes).map((type) => (
                <option key={type} value={type}>{t(`invoiceTypes.${type}`)}</option>
              ))}
            </Form.Control>
          </Col>
          <Col className="d-none d-sm-block">{t('form')}</Col>
          <Col className="d-flex">
            <Button
              variant="danger"
              className="ml-auto"
              onClick={resetForm}
            >
              {t('reset')}
            </Button>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body>
        {formType === invoiceTypes.INVOICE ? <>
          <TagGroup
            path={['ubl:Invoice']}
            formData={invoiceForm['ubl:Invoice']}
            docs={invoiceDocs['ubl:Invoice']}
            setErrorCount={setErrorCount}
          />
          <div className="d-flex mt-1">
            <Button variant="primary" className="ml-auto" onClick={submit} disabled={errorCount !== 0}>
              {t('generateInvoice')}
            </Button>
          </div>
        </> : <div>Coming soon</div>
        }
      </Card.Body>
    </Card>
  )
}
