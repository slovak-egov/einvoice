import {useCallback, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {get} from 'lodash'
import {Button, Radios} from '../../helpers/idsk'
import TagGroup from './TagGroup'
import DraftNameModal from '../DraftNameModal'
import ConfirmationButton from '../../helpers/ConfirmationButton'
import {formTypeSelector, formDataSelector, isFormInitialized, formDraftSelector} from './state'
import {initializeFormState, setFormType, setFormDraftMeta, submitInvoiceForm} from './actions'
import {
  areCodeListsLoadedSelector,
  isUblCreditNoteDocsLoadedSelector,
  isUblInvoiceDocsLoadedSelector,
  ublCreditNoteDocsSelector,
  ublInvoiceDocsSelector,
} from '../../cache/documentation/state'
import {getCodeLists, getUblCreditNoteDocs, getUblInvoiceDocs} from '../../cache/documentation/actions'
import {createDraft, updateDraft} from '../../cache/drafts/actions'
import {isUserLogged} from '../../cache/users/state'
import {invoiceTypes} from '../../utils/constants'

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
  const isLogged = useSelector(isUserLogged)
  const formType = useSelector(formTypeSelector)
  const isDocsLoaded = useSelector(invoiceTypeData[formType].isLoadedSelector)
  const areCodeListsLoaded = useSelector(areCodeListsLoadedSelector)
  const isFormLoaded = useSelector(isFormInitialized(formType))
  const docs = useSelector(invoiceTypeData[formType].docsSelector)
  const formData = useSelector(formDataSelector)
  const formDraft = useSelector(formDraftSelector)

  const dispatch = useDispatch()

  const [errorCount, setErrorCount] = useState(0)
  const [showCreateDraftModal, setShowCreateDraftModal] = useState(false)

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
    },
    [dispatch, formType],
  )

  const confirmDraft = (name) =>
    async () => {
      const draft = await dispatch(createDraft(name, formType, formData[formType]))
      if (draft) {
        await (dispatch(setFormDraftMeta({id: draft.id, name: draft.name})))
        history.push('/invoice-tools/drafts')
      }
    }

  const confirmUpdateDraft = async () => {
    await dispatch(updateDraft({id: formDraft.id, type: formType, data: formData[formType]}))
  }

  const allLoaded = areCodeListsLoaded && isDocsLoaded && isFormLoaded

  return (
    <>
      <div className="govuk-button-group">
        <h1 className="govuk-heading-l">{t('form')}</h1>
        <ConfirmationButton
          className="ml-auto govuk-button--warning"
          confirmationTitle={t('confirmationQuestions.resetForm.title')}
          confirmationText={t('confirmationQuestions.resetForm.text')}
          onClick={resetForm}
        >
          {t('reset')}
        </ConfirmationButton>
      </div>
      <Radios
        name="invoice-types-radios"
        className="govuk-radios--inline"
        value={formType}
        onChange={changeFormType}
        items={Object.values(invoiceTypes).map((type) => ({
          children: t(`invoiceTypes.${type}`),
          value: type,
        }))}
      />
      {/*Render once data are loaded*/}
      {allLoaded && <>
        <TagGroup
          path={invoiceTypeData[formType].rootPath}
          formData={get(formData, invoiceTypeData[formType].rootPath)}
          docs={docs[invoiceTypeData[formType].rootPath[1]]}
          setErrorCount={setErrorCount}
        />
        <div className="govuk-button-group">
          {isLogged &&
            <Button className="govuk-button--secondary" onClick={() => setShowCreateDraftModal(true)}>
              {t('saveAsNewDraft')}
            </Button>
          }
          {isLogged && formDraft &&
            <ConfirmationButton
              className="govuk-button--secondary"
              onClick={confirmUpdateDraft}
              confirmationTitle={t('confirmationQuestions.updateDraft.title')}
              confirmationText={t('confirmationQuestions.updateDraft.text', {name: formDraft.name})}
            >
              {t('updateDraft')}
            </ConfirmationButton>
          }
          {showCreateDraftModal &&
            <DraftNameModal
              title={t('createDraft')}
              cancel={() => setShowCreateDraftModal(false)}
              confirm={confirmDraft}
            />}
          <Button onClick={submit} disabled={errorCount !== 0}>
            {t('generateInvoice')}
          </Button>
        </div>
      </>}
    </>
  )
}
