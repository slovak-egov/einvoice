import React, {useState} from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {branch, lifecycle, renderNothing, withHandlers} from 'recompose'
import {Button, Card, Form, InputGroup} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'
import Auth from './helpers/Auth'
import {updateUser} from '../actions/users'
import {addUserSubstitute, getUserSubstitutes, removeUserSubstitute, setNewSubstituteId} from '../actions/substitutes'
import {getLoggedUser} from '../state/users'

const EditableField = ({actualValue, label, save, ...props}) => {
  const {t} = useTranslation('common')
  const [isEditing, setEditing] = useState(false)
  const [value, setValue] = useState(actualValue)

  return (
    <Form.Group>
      <div style={{marginBottom: '5px'}}>
        <Form.Label>{label}</Form.Label>
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
      {isEditing && <div style={{marginTop: '5px'}}>
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

const AccountSettings = ({
  addUserSubstitute, changeNewSubstituteId, loggedUser, newSubstituteId, removeUserSubstitute,
  substituteIds, updateUser,
}) => {
  const {t} = useTranslation(['common', 'TopBar'])
  return (
    <Card className="m-1">
      <Card.Header className="bg-primary text-white text-center" as="h3">{t('TopBar:tabs.accountSettings')}</Card.Header>
      <Card.Body>
        <Form.Group>
          <Form.Label>{t('userId')}</Form.Label>
          <Form.Control
            value={loggedUser.id}
            readOnly
          />
        </Form.Group>
        <EditableField
          actualValue={loggedUser.email}
          label={t('email')}
          save={(email) => updateUser({email})}
        />
        <EditableField
          actualValue={loggedUser.serviceAccountPublicKey}
          label={t('serviceAccountPublicKey')}
          save={(serviceAccountPublicKey) => updateUser({serviceAccountPublicKey})}
          as="textarea"
          rows={10}
        />
        <Form.Group>
          <Form.Label>{t('substituteIds')}</Form.Label>
          {substituteIds.map((id) => (
            <InputGroup key={id} style={{margin: '10px 0'}}>
              <Form.Control
                value={id}
                readOnly
                style={{maxWidth: '100px'}}
              />
              <InputGroup.Append>
                <Button variant="danger" onClick={removeUserSubstitute(id)} style={{margin: 0}}>X</Button>
              </InputGroup.Append>
            </InputGroup>
          ))}
          <InputGroup>
            <Form.Control
              value={newSubstituteId}
              style={{maxWidth: '100px'}}
              onChange={changeNewSubstituteId}
            />
            <InputGroup.Append>
              <Button
                variant="success"
                onClick={addUserSubstitute}
                style={{margin: 0}}
                disabled={newSubstituteId === ''}
              >
                +
              </Button>
            </InputGroup.Append>
          </InputGroup>
        </Form.Group>
      </Card.Body>
    </Card>
  )
}

export default Auth(
  compose(
    connect(
      (state) => {
        const loggedUser = getLoggedUser(state)
        return {
          loggedUser,
          substituteIds: loggedUser.substituteIds,
          newSubstituteId: state.accountScreen.newSubstituteId,
        }
      },
      {addUserSubstitute, getUserSubstitutes, removeUserSubstitute, setNewSubstituteId, updateUser}
    ),
    lifecycle({
      componentDidMount() {
        this.props.getUserSubstitutes()
      },
    }),
    withHandlers({
      removeUserSubstitute: ({removeUserSubstitute}) => (id) => () => removeUserSubstitute(id),
      addUserSubstitute: ({addUserSubstitute, newSubstituteId, setNewSubstituteId}) => async () => {
        if (await addUserSubstitute(newSubstituteId)) {
          setNewSubstituteId('')
        }
      },
      changeNewSubstituteId: ({setNewSubstituteId}) => (e) => {
        // Allow only digits
        setNewSubstituteId(e.target.value.replace(/[^0-9]/g, ''))
      },
    }),
    branch(
      ({substituteIds}) => substituteIds == null,
      renderNothing,
    ),
  )(AccountSettings)
)
