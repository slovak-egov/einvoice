import {useCallback, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import {format as formatDate, parseISO} from 'date-fns'
import {Table} from '../../helpers/idsk'
import {draftsSelector} from '../../cache/drafts/state'
import {deleteDraft, getDrafts} from '../../cache/drafts/actions'
import {initializeDraftForm} from '../form/actions'
import ConfirmationButton from '../../helpers/ConfirmationButton'

export default () => {
  const {t} = useTranslation('common')
  const history = useHistory()
  const drafts = useSelector(draftsSelector)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getDrafts())
  }, [dispatch])

  const openDraft = useCallback(
    async (id) => {
      if (await dispatch(initializeDraftForm(id))) {
        history.push('/invoice-tools/form')
      }
    }, [dispatch]
  )

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
                  onClick={() => openDraft(draft.id)}
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
              </>
            ),
          },
        ])}
      />
    </>
  )
}
