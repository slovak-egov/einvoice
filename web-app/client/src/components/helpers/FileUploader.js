import {Fragment, useRef} from 'react'
import {Button} from 'react-bootstrap'

export default ({accept, buttonStyle, buttonText, onChange}) => {
  const hiddenFileInput = useRef(null)
  return (
    <Fragment>
      <Button onClick={() => hiddenFileInput.current.click()} style={buttonStyle}>
        {buttonText}
      </Button>
      <input
        type="file"
        ref={hiddenFileInput}
        onChange={onChange}
        style={{display: 'none'}}
        accept={accept}
      />
    </Fragment>
  )
}
