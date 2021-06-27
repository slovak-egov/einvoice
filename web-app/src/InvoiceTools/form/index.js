import {useCallback, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {get} from 'lodash'
import {Button, Radios, Select} from '../../helpers/idsk'
import SimpleForm from './simple/SimpleForm'
import TagGroup from './TagGroup'
import DraftNameModal from '../DraftNameModal'
import ConfirmationButton from '../../helpers/ConfirmationButton'
import {formTypeSelector, formDataSelector, isFormInitialized, formDraftSelector, formComplexitySelector} from './state'
import {initializeFormState, setFormType, setFormDraftMeta, submitInvoiceForm, setFormComplexity} from './actions'
import {
  areCodeListsLoadedSelector,
  isUblCreditNoteDocsLoadedSelector,
  isUblInvoiceDocsLoadedSelector,
  ublCreditNoteDocsSelector,
  ublInvoiceDocsSelector,
} from '../../cache/documentation/state'
import {
  getCodeLists,
  getUblCreditNoteDocs,
  getUblInvoiceDocs,
} from '../../cache/documentation/actions'
import {createDraft, updateDraft} from '../../cache/drafts/actions'
import {isUserLogged} from '../../cache/users/state'
import {invoiceComplexities, invoiceTypes} from '../../utils/constants'
import {camelCaseToId} from './ids'


const invoiceTypeData = {
  [invoiceTypes.INVOICE]: {
    isLoadedSelector: isUblInvoiceDocsLoadedSelector,
    docsSelector: ublInvoiceDocsSelector,
    getDocs: getUblInvoiceDocs,
    [invoiceComplexities.SIMPLE]: {
      rootPath: ['invoice', 'simple'],
    },
    [invoiceComplexities.COMPLEX]: {
      rootPath: ['invoice', 'complex', 'ubl:Invoice'],
    },
  },
  [invoiceTypes.CREDIT_NOTE]: {
    isLoadedSelector: isUblCreditNoteDocsLoadedSelector,
    docsSelector: ublCreditNoteDocsSelector,
    getDocs: getUblCreditNoteDocs,
    [invoiceComplexities.SIMPLE]: {
      rootPath: ['creditNote', 'simple'],
    },
    [invoiceComplexities.COMPLEX]: {
      rootPath: ['creditNote', 'complex', 'ubl:CreditNote'],
    },
  },
}

export default () => {
  const {t} = useTranslation('common')
  const history = useHistory()
  const isLogged = useSelector(isUserLogged)
  const formType = useSelector(formTypeSelector)
  const formComplexity = useSelector(formComplexitySelector)
  const isDocsLoaded = useSelector(invoiceTypeData[formType].isLoadedSelector)
  const areCodeListsLoaded = useSelector(areCodeListsLoadedSelector)
  const isFormLoaded = useSelector(isFormInitialized(formType, formComplexity))
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
  }, [dispatch, formType, formComplexity, isDocsLoaded])

  useEffect(() => {
    if (!areCodeListsLoaded) {
      dispatch(getCodeLists())
    }
  }, [areCodeListsLoaded, dispatch])

  useEffect(() => {
    if (areCodeListsLoaded && isDocsLoaded && !isFormLoaded) {
      dispatch(initializeFormState(formType, formComplexity, docs))
    }
  }, [areCodeListsLoaded, dispatch, docs, formType, formComplexity, isDocsLoaded, isFormLoaded])

  const changeFormType = useCallback(
    (e) => dispatch(setFormType(e.target.value)), [dispatch],
  )

  const changeFormComplexity = useCallback(
    (e) => dispatch(setFormComplexity(e.target.value)), [dispatch],
  )

  const resetForm = useCallback(
    () => dispatch(initializeFormState(formType, formComplexity, docs)),
    [dispatch, formType, formComplexity, docs],
  )

  const submit = useCallback(
    async () => {
      await dispatch(submitInvoiceForm(
        formType,
        formComplexity,
        invoiceTypeData[formType][formComplexity].rootPath)
      )
      history.push('/invoice-tools/submission')
    },
    [dispatch, formType, formComplexity],
  )

  const confirmDraft = (name) =>
    async () => {
      const draft = await dispatch(createDraft(
        name,
        formType,
        formComplexity,
        formData[formType][formComplexity]
      ))
      if (draft) {
        await (dispatch(setFormDraftMeta({id: draft.id, name: draft.name})))
        history.push('/invoice-tools/drafts')
      }
    }

  const confirmUpdateDraft = async () => {
    await dispatch(updateDraft({
      id: formDraft.id,
      type: formType,
      complexity: formComplexity,
      data: formData[formType][formComplexity],
    }))
  }

  const allLoaded = areCodeListsLoaded && isDocsLoaded && isFormLoaded

  return (
    <>
      <div className="govuk-button-group">
        <h1 className="govuk-heading-l">{t('form')}</h1>
        <div className="ml-auto">
          <Select
            value={formComplexity}
            onChange={(e) => changeFormComplexity(e)}
            items={[
              {
                value: invoiceComplexities.SIMPLE,
                children: t('invoice.simple'),
                id: 'simple',
              },
              {
                value: invoiceComplexities.COMPLEX,
                children: t('invoice.complex'),
                id: 'complex',
              },
            ]}
            id="form-complexity"
          />
        </div>
        <ConfirmationButton
          className="ml-3 govuk-button--warning"
          confirmationTitle={t('confirmationQuestions.resetForm.title')}
          confirmationText={t('confirmationQuestions.resetForm.text')}
          onClick={resetForm}
          id="form-reset"
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
          id: camelCaseToId(type),
        }))}
      />
      {/*Render once data are loaded*/}
      {allLoaded && <>
        {
          formComplexity === invoiceComplexities.SIMPLE ?
            <SimpleForm
              formType={formType}
              path={[formType, formComplexity]}
              docs={docs[invoiceTypeData[formType][invoiceComplexities.COMPLEX].rootPath[2]]}
            />
            :
            <TagGroup
              path={invoiceTypeData[formType][formComplexity].rootPath}
              formData={get(formData, invoiceTypeData[formType][formComplexity].rootPath)}
              docs={docs[invoiceTypeData[formType][formComplexity].rootPath[2]]}
              setErrorCount={setErrorCount}
            />
        }
        <div className="govuk-button-group">
          {isLogged &&
            <Button
              className="govuk-button--secondary"
              onClick={() => setShowCreateDraftModal(true)}
              id="save-new-draft"
            >
              {t('saveAsNewDraft')}
            </Button>
          }
          {isLogged && formDraft &&
            <ConfirmationButton
              className="govuk-button--secondary"
              onClick={confirmUpdateDraft}
              confirmationTitle={t('confirmationQuestions.updateDraft.title')}
              confirmationText={t('confirmationQuestions.updateDraft.text', {name: formDraft.name})}
              id="save-updated-draft"
            >
              {t('updateDraft')}
            </ConfirmationButton>
          }
          {showCreateDraftModal &&
            <DraftNameModal
              title={t('createDraft')}
              cancel={() => setShowCreateDraftModal(false)}
              confirm={confirmDraft}
              id="create-draft"
            />}
          <Button onClick={submit} disabled={errorCount !== 0} id="generate-invoice">
            {t('generateInvoice')}
          </Button>
        </div>
      </>}
    </>
  )
}
