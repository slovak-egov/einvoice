import {useCallback, useEffect, useMemo} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useTranslation} from 'react-i18next'
import swal from 'sweetalert'
import classNames from 'classnames'
import {Button, Input, Label, Select} from '../../helpers/idsk'
import DatePicker from '../../helpers/DatePicker'
import FileUploader from '../../helpers/FileUploader'
import {formFieldSelector} from './state'
import {setFormField} from './actions'
import {codeListsSelector} from '../../cache/documentation/state'
import {allowedAttachmentMimeTypes, dataTypes} from '../../utils/constants'
import {fileToBase64, formatDate, parseDate} from '../../utils/helpers'

const fileToState = (file, name, mime) => ({
  text: file,
  attributes: {
    filename: [{text: name}],
    mimeCode: [{text: mime}],
  },
})

export default ({canDelete, dropField, docs, path, setErrorCount}) => {
  const {t, i18n} = useTranslation('common')
  // Uploading file is special case
  // We allow field to change its parent, it will set mime type and filename too
  const pathToUpdate = useMemo(
    () => docs.dataType === dataTypes.BINARY_OBJECT ? path.slice(0, -1) : path,
    [docs.dataType, path],
  )
  const value = useSelector(formFieldSelector(pathToUpdate)) || ''
  const dispatch = useDispatch()
  const contentError = value === '' ? t('errorMessages.emptyField') : null

  if (setErrorCount) {
    useEffect(
      () => {
        setErrorCount(contentError ? 1 : 0)
        return () => setErrorCount(0)
      }, [contentError],
    )
  }

  const updateField = useCallback(
    (value) => dispatch(setFormField(pathToUpdate)(value)),
    [dispatch, pathToUpdate],
  )

  return (
    <>
      <Label>
        {docs.name[i18n.language]}
        {canDelete &&
          <Button
            className="govuk-button--warning"
            style={{marginBottom: 0, marginLeft: '5px'}}
            onClick={dropField}
          >
            {t('delete')}
          </Button>
        }
      </Label>
      <FieldInput
        codeListIds={docs.codeLists}
        dataType={docs.dataType}
        updateField={updateField}
        value={value}
        error={contentError}
      />
    </>
  )
}

const FieldInput = ({codeListIds, dataType, error, updateField, value}) => {
  const {t} = useTranslation('common')
  const getValue = useCallback(
    async (e) => {
      switch (dataType) {
        case dataTypes.DATE: return formatDate(e)
        case dataTypes.BINARY_OBJECT:
          if (allowedAttachmentMimeTypes.includes(e.target.files[0].type)) {
            return fileToState(
              await fileToBase64(e.target.files[0]),
              e.target.files[0].name,
              e.target.files[0].type
            )
          } else {
            await swal({
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
    async (e) => updateField(await getValue(e)), [getValue, updateField],
  )
  const codeLists = useSelector(codeListsSelector)

  switch (dataType) {
    case dataTypes.DATE:
      return (
        <DatePicker
          className={classNames(error && 'govuk-input--error')}
          selected={parseDate(value)}
          onChange={onChange}
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
          fileName={value.attributes.filename[0].text}
        />
      )
    case dataTypes.PERCENTAGE:
      return (
        <Input
          className="govuk-input--width-5"
          suffix={{
            children: '%',
            className: 'input-suffix--secondary',
          }}
          value={value}
          onChange={onChange}
        />
      )
    case dataTypes.CODE:
      return (
        <Select
          items={[{}]}
          itemGroups={codeListIds.map((id) => ({
            label: id,
            items: Object.keys(codeLists[id].codes).map((code) => ({
              children: code,
              value: code,
            })),
          }))}
          value={value}
          onChange={onChange}
          errorMessage={error && {children: error}}
        />
      )
    default:
      return (
        <Input
          value={value}
          onChange={onChange}
          errorMessage={error && {children: error}}
        />
      )
  }
}
