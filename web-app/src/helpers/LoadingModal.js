import {Modal, Spinner} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'

export default () => {
  const {t} = useTranslation('common')
  return (
    <Modal show centered size="sm">
      <Modal.Header className="d-flex">
        <Modal.Title className="m-auto">{t('loading.title')}</Modal.Title>
      </Modal.Header>

      <Modal.Body className="d-flex">
        <Spinner animation="border" variant="primary" className="m-auto" />
      </Modal.Body>
    </Modal>
  )
}
