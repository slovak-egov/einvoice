import {useCallback, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useTranslation} from 'react-i18next'
import {Table} from 'react-bootstrap'
import {useHistory} from 'react-router-dom'
import {format as formatDate, parseISO} from 'date-fns'
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

  return (
    <>
      <h1 className="govuk-heading-l">{t('drafts')}</h1>
      <Table striped hover responsive size="sm">
        <thead>
          <tr>
            <th>#</th>
            <th>{t('invoiceDocs.name')}</th>
            <th className="d-none d-md-table-cell">{t('invoice.uploadedAt')}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {drafts && drafts.map((draft, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{draft.name}</td>
              <td className="d-none d-md-table-cell">
                {formatDate(parseISO(draft.createdAt), 'yyyy-MM-dd HH:mm')}
              </td>
              <td className="govuk-button-group" style={{float: 'right', marginRight: '0'}}>
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
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  )
}
