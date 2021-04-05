import {useRef} from 'react'
import {Button, Input} from './idsk'
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
        style={{display: 'none'}}
        accept={accept}
      />
    </>
  )
}

export default ({accept, buttonStyle, buttonText, deleteFile, fileName, uploadFile}) =>
  fileName ? (
    <Input
      className="govuk-input--width-10"
      suffix={{
        children: 'X',
        onClick: deleteFile,
        className: 'input-suffix--warning',
      }}
      value={fileName}
      readOnly
    />
  ) : (
    <FileUploader
      accept={accept}
      style={buttonStyle}
      text={buttonText}
      uploadFile={uploadFile}
    />
  )
