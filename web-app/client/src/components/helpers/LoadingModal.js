import './LoadingModal.css'
import {Modal, Spinner} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'

export default () => {
  const {t} = useTranslation('helpers')
  return (
    <div className="static-modal Modal">
      <Modal.Dialog>
        <Modal.Header style={{display: 'flex', backgroundColor: '#f3f3f3'}}>
          <Modal.Title className="m-auto">{t('loading.title')}</Modal.Title>
        </Modal.Header>

        <Modal.Body style={{display: 'flex', backgroundColor: '#f3f3f3'}}>
          <Spinner animation="border" variant="primary" className="m-auto" />
        </Modal.Body>
      </Modal.Dialog>
    </div>
  )
}
