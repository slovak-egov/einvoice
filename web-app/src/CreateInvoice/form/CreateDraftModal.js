import {useState} from 'react'
import {Modal, Button, Form} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'

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
        <Form.Group>
          <Form.Label>{t('invoiceDocs.name')}</Form.Label>
          <Form.Control
            isInvalid={isNameInvalid}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Form.Control.Feedback type="invalid">{t('errorMessages.emptyField')}</Form.Control.Feedback>
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="danger" onClick={cancel}>{t('cancel')}</Button>
        <Button variant="success" onClick={confirm(name)} disabled={isNameInvalid}>{t('confirm')}</Button>
      </Modal.Footer>
    </Modal>
  )
}
