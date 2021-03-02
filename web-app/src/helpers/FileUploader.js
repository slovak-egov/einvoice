import {useRef} from 'react'
import {Button, Form, InputGroup} from 'react-bootstrap'
import {clearEventTarget} from '../utils/helpers'

const FileUploader = ({accept, buttonStyle, buttonText, uploadFile}) => {
  const hiddenFileInput = useRef(null)
  return (
    <>
      <Button onClick={() => hiddenFileInput.current.click()} style={buttonStyle}>
        {buttonText}
      </Button>
      {/*We have to clear target in onClick, so we can upload same file multiple times in row*/}
      <input
        type="file"
        ref={hiddenFileInput}
        onChange={uploadFile}
        onClick={clearEventTarget}
        className="d-none"
        accept={accept}
      />
    </>
  )
}

export default ({accept, buttonStyle, buttonText, deleteFile, file, uploadFile}) =>
  file ? (
    <InputGroup>
      <Form.Control
        value={file.name}
        readOnly
        style={{maxWidth: '200px'}}
      />
      <InputGroup.Append>
        <Button variant="danger" onClick={deleteFile} className="m-0">X</Button>
      </InputGroup.Append>
    </InputGroup>
  ) : (
    <FileUploader
      accept={accept}
      buttonStyle={buttonStyle}
      buttonText={buttonText}
      uploadFile={uploadFile}
    />
  )
