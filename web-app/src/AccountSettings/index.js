import {useCallback, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Button, Form, InputGroup} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'
import Tooltip from '../helpers/Tooltip'
import {getLoggedUser} from '../cache/users/state'
import {getUserOrganizationIds, updateUser} from '../cache/users/actions'
import {addUserSubstitute, getUserSubstitutes, removeUserSubstitute} from '../cache/substitutes/actions'
import {keepDigitsOnly} from '../utils/validations'

const EditableField = ({actualValue, label, save, tooltipText, ...props}) => {
  const {t} = useTranslation('common')
  const [isEditing, setEditing] = useState(false)
  const [value, setValue] = useState(actualValue)

  return (
    <Form.Group>
      <div className="mb-1">
        <Form.Label>{label}</Form.Label>
        <Tooltip tooltipText={tooltipText} />
        {!isEditing &&
        <Button variant="primary" size="sm" onClick={() => setEditing(true)}>
          {t('edit')}
        </Button>
        }
      </div>
      <Form.Control
        value={value}
        readOnly={!isEditing}
        onChange={(e) => setValue(e.target.value)}
        {...props}
      />
      {isEditing && <div className="mt-1">
        <Button
          variant="danger"
          size="sm"
          onClick={() => {setValue(actualValue); setEditing(false)}}
        >
          {t('cancel')}
        </Button>
        <Button
          variant="success"
          size="sm"
          onClick={async () => await save(value) && setEditing(false)}
        >
          {t('save')}
        </Button>
      </div>}
    </Form.Group>
  )
}

export default () => {
  const {t} = useTranslation('common')

  const [newSubstituteId, setNewSubstituteId] = useState('')
  const loggedUser = useSelector(getLoggedUser)

  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(getUserSubstitutes())
    dispatch(getUserOrganizationIds())
  }, [dispatch])

  const removeSubstitute = useCallback(
    (id) => () => dispatch(removeUserSubstitute(id)), [dispatch]
  )
  const changeNewSubstituteId = useCallback(
    (e) => setNewSubstituteId(keepDigitsOnly(e.target.value)), []
  )
  const addSubstitute = useCallback(
    async () => {
      if (await dispatch(addUserSubstitute(newSubstituteId))) {
        setNewSubstituteId('')
      }
    },
    [dispatch, newSubstituteId]
  )
  const updateUserData = useCallback(
    (newData) => dispatch(updateUser(newData)), [dispatch]
  )

  // Data is still loading
  if (loggedUser.substituteIds == null || loggedUser.organizationIds == null) return null

  return (
    <>
      <h1 className="govuk-heading-l">{t('topBar.accountSettings')}</h1>
      <Form.Group>
        <Form.Label>{t('userId.label')}</Form.Label>
        <Tooltip tooltipText={t('userId.tooltip')} />
        <Form.Control
          value={loggedUser.id}
          readOnly
        />
      </Form.Group>
      <EditableField
        actualValue={loggedUser.serviceAccountPublicKey}
        label={t('accountPublicKey.label')}
        tooltipText={t('accountPublicKey.tooltip')}
        save={(serviceAccountPublicKey) => updateUserData({serviceAccountPublicKey})}
        as="textarea"
        rows={10}
      />
      <Form.Group>
        <Form.Label>{t('substituteIds.label')}</Form.Label>
        <Tooltip tooltipText={t('substituteIds.tooltip')} />
        <div className="d-flex flex-wrap">
          {loggedUser.substituteIds.map((id) => (
            <InputGroup className="m-1" key={id} style={{width: '115px'}}>
              <Form.Control
                value={id}
                readOnly
              />
              <InputGroup.Append>
                <Button className="m-0" variant="danger" onClick={removeSubstitute(id)}>X</Button>
              </InputGroup.Append>
            </InputGroup>
          ))}
          <InputGroup className="m-1" style={{width: '115px'}}>
            <Form.Control
              value={newSubstituteId}
              onChange={changeNewSubstituteId}
            />
            <InputGroup.Append>
              <Button
                variant="success"
                onClick={addSubstitute}
                className="m-0"
                disabled={newSubstituteId === ''}
              >
                +
              </Button>
            </InputGroup.Append>
          </InputGroup>
        </div>
      </Form.Group>
      <Form.Group>
        <Form.Label>{t('organizationIds.label')}</Form.Label>
        <Tooltip tooltipText={t('organizationIds.tooltip')} />
        <div className="d-flex flex-wrap">
          {loggedUser.organizationIds.length > 0 ?
            loggedUser.organizationIds.map((ico, i) => (
              <Form.Control
                key={i}
                value={ico}
                readOnly
                className="m-1"
                style={{width: '105px'}}
              />
            )) :
            <strong>{t('organizationIds.empty')}</strong>
          }
        </div>
      </Form.Group>
    </>
  )
}
