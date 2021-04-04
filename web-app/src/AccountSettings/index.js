import {useCallback, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useTranslation} from 'react-i18next'
import classNames from 'classnames'
import {Button, Hint, Input, Label, Textarea} from '../helpers/idsk'
import {getLoggedUser} from '../cache/users/state'
import {getUserOrganizationIds, updateUser} from '../cache/users/actions'
import {addUserSubstitute, getUserSubstitutes, removeUserSubstitute} from '../cache/substitutes/actions'
import {keepDigitsOnly} from '../utils/validations'

const EditableField = ({actualValue, label, save, tooltipText, ...props}) => {
  const {t} = useTranslation('common')
  const [isEditing, setEditing] = useState(false)
  const [value, setValue] = useState(actualValue)

  return (
    <>
      <Textarea
        hint={{children: tooltipText}}
        label={{children: label}}
        value={value}
        readOnly={!isEditing}
        onChange={(e) => setValue(e.target.value)}
        {...props}
      />
      <div className="govuk-button-group" style={{marginTop: '-15px'}}>
        {isEditing ? <>
          <Button
            className="govuk-button--warning"
            onClick={() => {setValue(actualValue); setEditing(false)}}
          >
            {t('cancel')}
          </Button>
          <Button onClick={async () => await save(value) && setEditing(false)}>
            {t('save')}
          </Button>
        </> : <Button className="govuk-button--secondary" onClick={() => setEditing(true)}>
          {t('edit')}
        </Button>}
      </div>
    </>
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
      // Do not do anything if newSubstituteId is not defined
      if (newSubstituteId === '') return

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
      <Input
        className="govuk-input--width-5"
        label={{children: t('userId.label')}}
        hint={{children: t('userId.tooltip')}}
        value={loggedUser.id}
        readOnly
      />
      <EditableField
        actualValue={loggedUser.serviceAccountPublicKey}
        label={t('accountPublicKey.label')}
        tooltipText={t('accountPublicKey.tooltip')}
        save={(serviceAccountPublicKey) => updateUserData({serviceAccountPublicKey})}
        rows={10}
      />
      <Label>{t('substituteIds.label')}</Label>
      <Hint>{t('substituteIds.tooltip')}</Hint>
      <div style={{display: 'flex', flexWrap: 'wrap'}}>
        {loggedUser.substituteIds.map((id) => (
          <Input
            className="govuk-input--width-5"
            key={id}
            suffix={{
              children: '-',
              onClick: removeSubstitute(id),
              className: 'input-suffix--warning',
            }}
            value={id}
            readOnly
          />
        ))}
        <Input
          className="govuk-input--width-5"
          suffix={{
            children: '+',
            onClick: addSubstitute,
            className: classNames('input-suffix--success', newSubstituteId === '' && 'input-suffix-disabled'),
          }}
          value={newSubstituteId}
          onChange={changeNewSubstituteId}
        />
      </div>
      <Label>{t('organizationIds.label')}</Label>
      <Hint>{t('organizationIds.tooltip')}</Hint>
      <div style={{display: 'flex', flexWrap: 'wrap'}}>
        {loggedUser.organizationIds.length > 0 ?
          loggedUser.organizationIds.map((ico, i) => (
            <Input
              key={i}
              className="govuk-input--width-5"
              value={ico}
              readOnly
            />
          )) :
          <strong>{t('organizationIds.empty')}</strong>
        }
      </div>
    </>
  )
}
