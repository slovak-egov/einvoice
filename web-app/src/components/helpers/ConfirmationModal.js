import React from 'react'
import {Modal, Button} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'

const ConfirmationModal = ({cancel, confirm, text, title}) => {
  const {t} = useTranslation('common')
  return (
    <div className="static-modal Modal" style={{cursor: 'default'}}>
      <Modal.Dialog>
        <Modal.Header className="d-flex">
          <Modal.Title className="m-auto">{title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>{text}</Modal.Body>

        <Modal.Footer>
          <Button variant="danger" onClick={cancel}>{t('cancel')}</Button>
          <Button variant="success" onClick={confirm}>{t('confirm')}</Button>
        </Modal.Footer>
      </Modal.Dialog>
    </div>
  )
}


export default class extends React.Component {
  state = {
    open: false,
    callback: null,
  }

  show = (callback) => () => {
    this.setState({
      open: true,
      callback,
    })
  }

  hide = () => this.setState({open: false, callback: null})

  confirm = (arg) => {
    this.state.callback(arg)
    this.hide()
  }

  render = () => (
    <>
      {this.props.children(this.show)}
      {this.state.open && (
        <ConfirmationModal
          title={this.props.title}
          text={this.props.text}
          confirm={this.confirm}
          cancel={this.hide}
        />
      )}
    </>
  )
}
