import {useState} from 'react'
import {Modal} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'
import {Button, Input} from '../../helpers/idsk'

export default ({cancel, confirm}) => {
  const {t} = useTranslation('common')
  const [name, setName] = useState('')
  const isNameInvalid = name === ''
  return (
    <Modal show centered>
      <Modal.Header className="d-flex">
        <Modal.Title className="m-auto">{t('createDraft')}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Input
          errorMessage={isNameInvalid && {children: t('errorMessages.emptyField')}}
          label={{children: t('invoiceDocs.name')}}
          value={name}
          onChange={(e) => setName(e.target.value)}
          type="text"
        />
      </Modal.Body>

      <Modal.Footer>
        <Button className="govuk-button--warning" onClick={cancel}>{t('cancel')}</Button>
        <Button onClick={confirm(name)} disabled={isNameInvalid}>{t('confirm')}</Button>
      </Modal.Footer>
    </Modal>
  )
}
