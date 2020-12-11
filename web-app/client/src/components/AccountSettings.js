import React, {useState} from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {branch, lifecycle, renderNothing, withHandlers} from 'recompose'
import {Button, Card, Form, InputGroup} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'
import Auth from './helpers/Auth'
import Tooltip from './helpers/Tooltip'
import {getUserOrganizationIcos, updateUser} from '../actions/users'
import {
  addUserSubstitute, getUserSubstitutes, removeUserSubstitute, setNewSubstituteId,
} from '../actions/substitutes'
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

const AccountSettings = ({
  addUserSubstitute, changeNewSubstituteId, loggedUser, newSubstituteId, removeUserSubstitute,
  substituteIds, updateUser,
}) => {
  const {t} = useTranslation(['common', 'TopBar'])
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
          save={(email) => updateUser({email})}
        />
        <EditableField
          actualValue={loggedUser.serviceAccountPublicKey}
          label={t('accountPublicKey.label')}
          tooltipText={t('accountPublicKey.tooltip')}
          save={(serviceAccountPublicKey) => updateUser({serviceAccountPublicKey})}
          as="textarea"
          rows={10}
        />
        <Form.Group>
          <Form.Label>{t('substituteIds.label')}</Form.Label>
          <Tooltip tooltipText={t('substituteIds.tooltip')} />
          <div className="d-flex flex-wrap">
            {substituteIds.map((id) => (
              <InputGroup className="m-1" key={id} style={{width: '115px'}}>
                <Form.Control
                  value={id}
                  readOnly
                />
                <InputGroup.Append>
                  <Button className="m-0" variant="danger" onClick={removeUserSubstitute(id)}>X</Button>
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
                  onClick={addUserSubstitute}
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
          { loggedUser && loggedUser.organizationIcos && loggedUser.organizationIcos.length > 0 ?
            loggedUser.organizationIcos.map((ico, i) => (
              <div key={i}>{ico}</div>
            )) :
            <div>{t('organizationIcos.empty')}</div>
          }
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
      {addUserSubstitute, getUserSubstitutes, removeUserSubstitute, setNewSubstituteId, updateUser, getUserOrganizationIcos}
    ),
    lifecycle({
      componentDidMount() {
        this.props.getUserSubstitutes()
        this.props.getUserOrganizationIcos()
      },
    }),
    withHandlers({
      removeUserSubstitute: ({removeUserSubstitute}) => (id) => () => removeUserSubstitute(id),
      addUserSubstitute: ({addUserSubstitute, newSubstituteId, setNewSubstituteId}) => async () => {
        if (await addUserSubstitute(newSubstituteId)) {
          setNewSubstituteId('')
        }
      },
      changeNewSubstituteId: ({setNewSubstituteId}) => (e) =>
        setNewSubstituteId(keepDigitsOnly(e.target.value)),
    }),
    branch(
      ({substituteIds}) => substituteIds == null,
      renderNothing,
    ),
  )(AccountSettings)
)
