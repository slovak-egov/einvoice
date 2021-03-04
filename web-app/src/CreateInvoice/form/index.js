import {useCallback, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {Button, Card, Col, Form, Row} from 'react-bootstrap'
import {get} from 'lodash'
import TagGroup from './TagGroup'
import {formTypeSelector, formDataSelector, isFormInitialized} from './state'
import {initializeFormState, setFormType, submitInvoiceForm} from './actions'
import {
  areCodeListsLoadedSelector,
  isUblCreditNoteDocsLoadedSelector,
  isUblInvoiceDocsLoadedSelector,
  ublCreditNoteDocsSelector,
  ublInvoiceDocsSelector,
} from '../../cache/documentation/state'
import {getCodeLists, getUblCreditNoteDocs, getUblInvoiceDocs} from '../../cache/documentation/actions'
import {invoiceTypes} from '../../utils/constants'
import ConfirmationButton from '../../helpers/ConfirmationButton'

const invoiceTypeData = {
  [invoiceTypes.INVOICE]: {
    isLoadedSelector: isUblInvoiceDocsLoadedSelector,
    docsSelector: ublInvoiceDocsSelector,
    getDocs: getUblInvoiceDocs,
    rootPath: ['invoice', 'ubl:Invoice'],
  },
  [invoiceTypes.CREDIT_NOTE]: {
    isLoadedSelector: isUblCreditNoteDocsLoadedSelector,
    docsSelector: ublCreditNoteDocsSelector,
    getDocs: getUblCreditNoteDocs,
    rootPath: ['creditNote', 'ubl:CreditNote'],
  },
}

export default () => {
  const {t} = useTranslation('common')
  const history = useHistory()
  const formType = useSelector(formTypeSelector)
  const isDocsLoaded = useSelector(invoiceTypeData[formType].isLoadedSelector)
  const areCodeListsLoaded = useSelector(areCodeListsLoadedSelector)
  const isFormLoaded = useSelector(isFormInitialized(formType))
  const docs = useSelector(invoiceTypeData[formType].docsSelector)
  const formData = useSelector(formDataSelector)
  const dispatch = useDispatch()

  const [errorCount, setErrorCount] = useState(0)

  // We need to have separate useEffects, so requests can be done in parallel
  useEffect(() => {
    if (!isDocsLoaded) {
      dispatch(invoiceTypeData[formType].getDocs())
    }
  }, [dispatch, formType, isDocsLoaded])

  useEffect(() => {
    if (!areCodeListsLoaded) {
      dispatch(getCodeLists())
    }
  }, [areCodeListsLoaded, dispatch])

  useEffect(() => {
    if (areCodeListsLoaded && isDocsLoaded && !isFormLoaded) {
      dispatch(initializeFormState(formType, docs))
    }
  }, [areCodeListsLoaded, dispatch, docs, formType, isDocsLoaded, isFormLoaded])

  const changeFormType = useCallback(
    (e) => dispatch(setFormType(e.target.value)), [dispatch],
  )

  const resetForm = useCallback(
    () => dispatch(initializeFormState(formType, docs)), [dispatch, formType, docs],
  )

  const submit = useCallback(
    async () => {
      await dispatch(submitInvoiceForm(formType, invoiceTypeData[formType].rootPath))
      history.push('/invoice-tools/submission')
    }, [dispatch, formType])

  return (
    <Card className="m-1">
      <Card.Header className="bg-primary text-center" as="h3">
        <Row className="d-block d-sm-none text-white">{t('form')}</Row>
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
          <Col className="d-none d-sm-block text-white">{t('form')}</Col>
          <Col className="d-flex">
            <ConfirmationButton
              variant="danger"
              className="ml-auto"
              confirmationTitle={t('confirmationQuestions.resetForm.title')}
              confirmationText={t('confirmationQuestions.resetForm.text')}
              onClick={resetForm}
            >
              {t('reset')}
            </ConfirmationButton>
          </Col>
        </Row>
      </Card.Header>
      {/*Render once data are loaded*/}
      {isFormLoaded && <Card.Body>
        <TagGroup
          path={invoiceTypeData[formType].rootPath}
          formData={get(formData, invoiceTypeData[formType].rootPath)}
          docs={docs[invoiceTypeData[formType].rootPath[1]]}
          setErrorCount={setErrorCount}
        />
        <div className="d-flex mt-1">
          <Button variant="primary" className="ml-auto" onClick={submit} disabled={errorCount !== 0}>
            {t('generateInvoice')}
          </Button>
        </div>
      </Card.Body>}
    </Card>
  )
}
