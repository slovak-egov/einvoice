import {useCallback, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import {format as formatDate, parseISO} from 'date-fns'
import {Button, Table} from '../../helpers/idsk'
import {draftsSelector} from '../../cache/drafts/state'
import {updateDraft, deleteDraft, getDrafts} from '../../cache/drafts/actions'
import {initializeDraftForm} from '../form/actions'
import ConfirmationButton from '../../helpers/ConfirmationButton'
import DraftNameModal from '../DraftNameModal'

export default () => {
  const {t} = useTranslation('common')
  const history = useHistory()
  const drafts = useSelector(draftsSelector)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getDrafts())
  }, [dispatch])

  const openDraft = useCallback(
    async (draft) => {
      if (await dispatch(initializeDraftForm(draft))) {
        history.push('/invoice-tools/form')
      }
    }, [dispatch]
  )

  const [renameDraftModalData, setRenameDraftModalData] = useState(null)

  const renameDraft = (id) => (name) =>
    async () => {
      if (await dispatch(updateDraft({id, name}))) {
        await dispatch(getDrafts())
        setRenameDraftModalData(null)
      }
    }

  // Data is still loading
  if (drafts == null) return null

  return (
    <>
      <h1 className="govuk-heading-l">{t('drafts')}</h1>
      <Table
        head={[
          {children: '#'},
          {children: t('invoiceDocs.name')},
          {children: t('invoice.uploadedAt'), className: 'd-none-mobile'},
          {children: ''},
        ]}
        rows={drafts.map((draft, i) => [
          {children: i + 1},
          {children: draft.name},
          {
            children: formatDate(parseISO(draft.createdAt), 'yyyy-MM-dd HH:mm'),
            className: 'd-none-mobile',
          },
          {
            children: (
              <>
                <ConfirmationButton
                  onClick={() => openDraft(draft)}
                  confirmationTitle={t('confirmationQuestions.openDraft.title')}
                  confirmationText={t('confirmationQuestions.openDraft.text')}
                >
                  {t('open')}
                </ConfirmationButton>
                <ConfirmationButton
                  className="govuk-button--warning"
                  onClick={() => dispatch(deleteDraft(draft.id))}
                  confirmationTitle={t('confirmationQuestions.deleteDraft.title')}
                  confirmationText={t('confirmationQuestions.deleteDraft.text')}
                >
                  {t('delete')}
                </ConfirmationButton>
                <Button className="govuk-button--secondary" onClick={() => setRenameDraftModalData({id: draft.id, name: draft.name})}>
                  {t('rename')}
                </Button>
              </>
            ),
          },
        ])}
      />
      {renameDraftModalData &&
        <DraftNameModal
          title={t('renameDraft')}
          initName={renameDraftModalData.name}
          cancel={() => setRenameDraftModalData(null)}
          confirm={renameDraft(renameDraftModalData.id)}
        />}
    </>
  )
}
