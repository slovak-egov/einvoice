import React, {useCallback, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Button, Card, Form, InputGroup} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'
import Tooltip from './helpers/Tooltip'
import {getUserOrganizationIcos, updateUser} from '../actions/users'
import {
  addUserSubstitute, getUserSubstitutes, removeUserSubstitute, setNewSubstituteId,
} from '../actions/substitutes'
import {newSubstituteIdSelector} from '../state/accountScreen'
import {getLoggedUser} from '../state/users'
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
  const {t} = useTranslation(['common', 'TopBar'])

  const newSubstituteId = useSelector(newSubstituteIdSelector)
  const loggedUser = useSelector(getLoggedUser)

  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(getUserSubstitutes())
    dispatch(getUserOrganizationIcos())
  }, [dispatch])

  const removeSubstitute = useCallback(
    (id) => () => dispatch(removeUserSubstitute(id)), [dispatch]
  )
  const changeNewSubstituteId = useCallback(
    (e) => dispatch(setNewSubstituteId(keepDigitsOnly(e.target.value))), [dispatch]
  )
  const addSubstitute = useCallback(
    async () => {
      if (await dispatch(addUserSubstitute(newSubstituteId))) {
        dispatch(setNewSubstituteId(''))
      }
    },
    [dispatch, newSubstituteId]
  )
  const updateUserData = useCallback(
    (newData) => dispatch(updateUser(newData)), [dispatch]
  )

  // Data is still loading
  if (loggedUser.substituteIds == null || loggedUser.organizationIcos == null) return null

  return (
    <Card className="m-1">
      <Card.Header className="bg-primary text-white text-center" as="h3">
        {t('TopBar:tabs.accountSettings')}
      </Card.Header>
      <Card.Body>
        <Form.Group>
          <Form.Label>{t('userId.label')}</Form.Label>
          <Tooltip tooltipText={t('userId.tooltip')} />
          <Form.Control
            value={loggedUser.id}
            readOnly
          />
        </Form.Group>
        <EditableField
          actualValue={loggedUser.email}
          label={t('email.label')}
          tooltipText={t('email.tooltip')}
          save={(email) => updateUserData({email})}
        />
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
          <Form.Label>{t('organizationIcos.label')}</Form.Label>
          <Tooltip tooltipText={t('organizationIcos.tooltip')} />
          <div className="d-flex flex-wrap">
            {loggedUser.organizationIcos.length > 0 ?
              loggedUser.organizationIcos.map((ico, i) => (
                <Form.Control
                  key={i}
                  value={ico}
                  readOnly
                  className="m-1"
                  style={{width: '105px'}}
                />
              )) :
              <strong>{t('organizationIcos.empty')}</strong>
            }
          </div>
        </Form.Group>
      </Card.Body>
    </Card>
  )
}
