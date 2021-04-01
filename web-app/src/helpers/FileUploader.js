import {useRef} from 'react'
import {Form, InputGroup} from 'react-bootstrap'
import {Button} from './idsk'
import {clearEventTarget} from '../utils/helpers'

const FileUploader = ({accept, style, text, uploadFile}) => {
  const hiddenFileInput = useRef(null)
  return (
    <>
      <Button onClick={() => hiddenFileInput.current.click()} style={style}>
        {text}
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

export default ({accept, buttonStyle, buttonText, deleteFile, fileName, uploadFile}) =>
  fileName ? (
    <InputGroup>
      <Form.Control
        value={fileName}
        readOnly
        style={{maxWidth: '200px'}}
      />
      <InputGroup.Append>
        <Button onClick={deleteFile} className="govuk-button--warning">X</Button>
      </InputGroup.Append>
    </InputGroup>
  ) : (
    <FileUploader
      accept={accept}
      style={buttonStyle}
      text={buttonText}
      uploadFile={uploadFile}
    />
  )
