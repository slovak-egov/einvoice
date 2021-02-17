import {useCallback} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useTranslation} from 'react-i18next'
import {Button, Form} from 'react-bootstrap'
import DatePicker from '../../helpers/DatePicker'
import FileUploader from '../../helpers/FileUploader'
import Tooltip from '../../helpers/Tooltip'
import {invoiceFormFieldSelector} from './state'
import {setInvoiceFormField} from './actions'
import {codeListsSelector} from '../../cache/documentation/state'

export default ({canDelete, dropField, docs, path}) => {
  const {t, i18n} = useTranslation('common')
  const value = useSelector(invoiceFormFieldSelector(path)) || ''
  const dispatch = useDispatch()

  const updateField = useCallback(
    (value) => dispatch(setInvoiceFormField(path)(value)), [dispatch, path],
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
      />
    </Form.Group>
  )
}

const FieldInput = ({codeListIds, dataType, updateField, value}) => {
  const {t} = useTranslation()
  const getValue = useCallback(
    (e) => {
      switch (dataType) {
        case 'Date': return e
        case 'Binary object': return e.target.files[0]
        case 'Percentage': {
          let result = '', digits = 0, decimalPart = false
          for (const c of e.target.value.replace(/[^0-9.]/g, '')) {
            if (c === '.') {
              if (decimalPart) break
              if (digits === 0)result += '0'
              decimalPart = true
            } else if (decimalPart === false) {
              digits += 1
              if (digits > 2) return '100'
            }
            result += c
          }
          return result
        }
        case 'Quantity': return e.target.value.replace(/[^0-9]/g, '')
        case 'Amount': {
          // Only number with up to 2 decimal digits allowed
          let result = '', decimalDigits = 0
          for (const c of e.target.value.replace(/[^0-9.]/g, '')) {
            if (c === '.' && decimalDigits !== 0) break
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
    case 'Date':
      return (
        <DatePicker
          selected={value}
          onChange={onChange}
          className="form-control"
          dateFormat="yyyy-MM-dd"
        />
      )
    case 'Binary object':
      return (
        <FileUploader
          buttonText={t('upload')}
          uploadFile={onChange}
          deleteFile={() => updateField('')}
          file={value}
        />
      )
    case 'Percentage':
      return (
        <div className="d-flex">
          <Form.Control
            value={value}
            onChange={onChange}
            className="text-right"
            style={{maxWidth: '100px'}}
          />
          <span className="my-auto ml-1">%</span>
        </div>
      )
    case 'Code':
      return (
        <Form.Control
          as="select"
          style={{maxWidth: '100px'}}
          onChange={onChange}
          value={value}
        >
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
        />
      )
  }
}
