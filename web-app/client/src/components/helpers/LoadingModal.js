import './LoadingModal.css'
import React from 'react'
import {Modal} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'

export default () => {
  const {t} = useTranslation('helpers')
  return (
    <div className="static-modal Modal">
      <Modal.Dialog>
        <Modal.Header style={{display: 'flex', backgroundColor: '#f3f3f3'}}>
          <Modal.Title style={{margin: 'auto'}}>{t('loading.title')}</Modal.Title>
        </Modal.Header>

        <Modal.Body style={{display: 'flex', backgroundColor: '#f3f3f3'}}>
          <div className="loader" />
        </Modal.Body>
      </Modal.Dialog>
    </div>
  )
}
