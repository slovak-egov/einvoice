import {useRef} from 'react'
import {Button, Input} from './idsk'
import {clearEventTarget} from '../utils/helpers'

const FileUploader = ({accept, style, text, uploadFile, id}) => {
  const hiddenFileInput = useRef(null)
  return (
    <>
      <Button onClick={() => hiddenFileInput.current.click()} style={style} id={`${id}-upload`}>
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
        id={`${id}-input`}
      />
    </>
  )
}

export default ({accept, buttonStyle, buttonText, deleteFile, fileName, uploadFile, id}) =>
  fileName ? (
    <Input
      className="govuk-input--width-10"
      suffix={{
        children: 'X',
        onClick: deleteFile,
        className: 'input-suffix--warning',
        id: `${id}-delete`,
      }}
      value={fileName}
      readOnly
      id={`${id}-name`}
    />
  ) : (
    <FileUploader
      accept={accept}
      style={buttonStyle}
      text={buttonText}
      uploadFile={uploadFile}
      id={id}
    />
  )
