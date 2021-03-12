import {useCallback, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useTranslation} from 'react-i18next'
import {Button, Form} from 'react-bootstrap'
import swal from 'sweetalert'
import classnames from 'classnames'
import DatePicker from '../../helpers/DatePicker'
import FileUploader from '../../helpers/FileUploader'
import Tooltip from '../../helpers/Tooltip'
import {formFieldSelector} from './state'
import {setFormField} from './actions'
import {codeListsSelector} from '../../cache/documentation/state'
import {allowedAttachmentMimeTypes, dataTypes} from '../../utils/constants'

const fileToState = (file, name, mime) => ({
  text: file,
  attributes: {
    filename: [{text: name}],
    mimeCode: [{text: mime}],
  },
})

export default ({canDelete, dropField, docs, path, setErrorCount}) => {
  const {t, i18n} = useTranslation('common')
  const value = useSelector(formFieldSelector(path)) || ''
  const dispatch = useDispatch()
  const isInvalid = value === ''

  useEffect(
    () => {
      setErrorCount(isInvalid ? 1 : 0)
      return () => setErrorCount(0)
    }, [isInvalid],
  )

  const updateField = useCallback(
    (value) => {
      // Uploading file is special case
      // We allow field to change its parent, it will set mime type and filename too
      const pathToUpdate = docs.dataType === dataTypes.BINARY_OBJECT ? path.slice(0, -1) : path
      dispatch(setFormField(pathToUpdate)(value))
    }, [dispatch, docs.dataType, path]
  )

  return (
    <Form.Group>
      <div className="d-flex">
        <Form.Label className="d-flex">
          <span>{docs.name[i18n.language]}</span>
          <Tooltip className="my-auto" tooltipText={docs.description[i18n.language]} />
        </Form.Label>
        {canDelete && <Button className="ml-auto mb-1" variant="danger" size="sm" onClick={dropField}>
          {t('delete')}
        </Button>}
      </div>
      <FieldInput
        codeListIds={docs.codeLists}
        dataType={docs.dataType}
        updateField={updateField}
        value={value}
        isInvalid={isInvalid}
      />
      <Form.Control.Feedback type="invalid">{t('errorMessages.emptyField')}</Form.Control.Feedback>
    </Form.Group>
  )
}

const FieldInput = ({codeListIds, dataType, isInvalid, updateField, value}) => {
  const {t} = useTranslation('common')
  const getValue = useCallback(
    (e) => {
      switch (dataType) {
        case dataTypes.DATE: return e
        case dataTypes.BINARY_OBJECT:
          if (allowedAttachmentMimeTypes.includes(e.target.files[0].type)) {
            return fileToState(e.target.files[0], e.target.files[0].name, e.target.files[0].type)
          } else {
            swal({
              title: t('errorMessages.unsupportedMimeType'),
              icon: 'error',
            })
            return fileToState('', '', '')
          }
        case dataTypes.PERCENTAGE: {
          let result = '', digits = 0, decimalPart = false
          for (const c of e.target.value.replace(/[^0-9.]/g, '')) {
            if (c === '.') {
              if (decimalPart || digits === 0) break
              decimalPart = true
            } else if (decimalPart === false) {
              digits += 1
              if (digits > 2) return '100'
            }
            result += c
          }
          return result
        }
        case dataTypes.QUANTITY: return e.target.value.replace(/[^0-9]/g, '')
        case dataTypes.AMOUNT: {
          // Only number with up to 2 decimal digits allowed
          let result = '', decimalDigits = 0
          for (const c of e.target.value.replace(/[^0-9.]/g, '')) {
            if (c === '.' && decimalDigits !== 0) break
            // Dot cannot be first character
            if (c === '.' && result === '') break
            if (decimalDigits > 2) break
            if (decimalDigits > 0 || c === '.') decimalDigits += 1
            result += c
          }
          return result
        }
        default: return e.target.value
      }
    },
    [dataType]
  )
  const onChange = useCallback(
    (e) => updateField(getValue(e)), [getValue, updateField],
  )
  const codeLists = useSelector(codeListsSelector)

  switch (dataType) {
    case dataTypes.DATE:
      return (
        <DatePicker
          selected={value}
          onChange={onChange}
          className={classnames({'is-invalid': isInvalid})}
          dateFormat="yyyy-MM-dd"
        />
      )
    case dataTypes.BINARY_OBJECT:
      return (
        <FileUploader
          accept={allowedAttachmentMimeTypes.join(',')}
          buttonText={t('upload')}
          uploadFile={onChange}
          deleteFile={() => updateField(fileToState('', '', ''))}
          file={value}
        />
      )
    case dataTypes.PERCENTAGE:
      return (
        <div className="d-flex">
          <Form.Control
            value={value}
            onChange={onChange}
            className="text-right"
            style={{maxWidth: '100px'}}
            isInvalid={isInvalid}
          />
          <span className="my-auto ml-1">%</span>
        </div>
      )
    case dataTypes.CODE:
      return (
        <Form.Control
          as="select"
          className="w-auto"
          style={{maxWidth: '100%'}}
          onChange={onChange}
          value={value}
          isInvalid={isInvalid}
        >
          {/*Add empty option*/}
          <option />
          {codeListIds.map((id, i) => (
            <optgroup key={i} label={id}>
              {Object.keys(codeLists[id].codes).map((code, index) => (
                <option key={index} value={code}>{code}</option>
              ))}
            </optgroup>
          ))}
        </Form.Control>
      )
    default:
      return (
        <Form.Control
          value={value}
          onChange={onChange}
          isInvalid={isInvalid}
        />
      )
  }
}
