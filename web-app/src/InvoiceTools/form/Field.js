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
import {codeListsSelector, formValidationDocsSelector} from '../../cache/documentation/state'
import {allowedAttachmentMimeTypes, dataTypes} from '../../utils/constants'
import {fileToBase64, formatDate, parseDate} from '../../utils/helpers'
import {Link} from 'react-router-dom'
import {pathToId} from './ids'
import {getValidationFunction} from '../../helpers/validations'

const fileToState = (file, name, mime) => ({
  text: file,
  attributes: {
    filename: [{text: name}],
    mimeCode: [{text: mime}],
  },
})

export const ComplexField = ({canDelete, dropField, docs, path, setErrorCount}) => {
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
            id={`remove-${pathToId(path)}`}
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
        id={pathToId(path)}
      />
    </>
  )
}

export const Field = ({docs, label, path, value, notEditable, id, errorCounter,
  validationCondition}) => {

  const {i18n} = useTranslation('common')
  const dispatch = useDispatch()
  const currentValue = useSelector(formFieldSelector(path)) || ''
  const validationDocs = useSelector(formValidationDocsSelector)
  const validations = docs.formValidations || []
  const validationRules = validations.map((id) => {
    const doc = validationDocs[id]
    return {
      doc,
      rule: getValidationFunction(doc),
    }
  })

  useEffect(() => {
    if (value !== undefined && currentValue !== value) {
      dispatch(setFormField(path)(value))
    }
  }, [dispatch, value])

  const violation = validationRules.find((x) => {
    return x.rule.applicable(validationCondition, currentValue) && x.rule.isViolation(currentValue)
  })
  const contentError = violation ? violation.doc.message[i18n.language] : null

  if (errorCounter) {
    useEffect(
      () => {
        errorCounter(id, contentError ? 1 : 0,
          validationRules.some((v) => v.rule.applicable(validationCondition, currentValue)) ? 1 : 0)
      }, [contentError, validations.join(','), validationCondition, currentValue],
    )
  }

  const updateField = useCallback(
    (value) => {
      if (!notEditable) {
        dispatch(setFormField(path)(value))
      }
    }, [dispatch],
  )

  const businessTerms = []
  if (docs && docs.businessTerms) {
    businessTerms.push(' (')
    docs.businessTerms.forEach((id) => {
      businessTerms.push(<Link key={id} to={`/invoiceDocumentation/businessTerms/${id}`}>{id}</Link>)
      businessTerms.push(', ')
    })
    businessTerms[businessTerms.length - 1] = ')'
  }

  return (
    <>
      <Label>
        {label}{businessTerms}
      </Label>
      <FieldInput
        codeListIds={docs && docs.codeLists}
        dataType={docs && docs.dataType}
        updateField={updateField}
        value={currentValue}
        violation={violation}
        notEditable={notEditable}
        id={id}
      />
    </>
  )
}

const FieldInput = ({codeListIds, dataType, violation, updateField, value, notEditable, id}) => {
  const {t, i18n} = useTranslation('common')
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

  const error = violation && {
    children: (<>
      <div>{violation.doc.message[i18n.language]}</div>
      {violation.doc.description && (
        <div>{violation.doc.description[i18n.language]}</div>
      ) }
    </>),
    visuallyHiddenText: violation.doc.description && violation.doc.description[i18n.language],
  }

  switch (dataType) {
    case dataTypes.DATE:
      return (
        <DatePicker
          className={classNames(error && 'govuk-input--error')}
          selected={parseDate(value)}
          onChange={onChange}
          dateFormat="yyyy-MM-dd"
          id={id}
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
          id={id}
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
          errorMessage={error}
          onFocus={(e) => notEditable && e.target.blur()}
          id={id}
        />
      )
    case dataTypes.CODE:
      return (
        <Select
          items={[{style: notEditable && {display: 'none'}}]}
          itemGroups={codeListIds.map((codeListId) => ({
            label: codeListId,
            items: Object.entries(codeLists[codeListId].codes).map(([id, code]) => ({
              children: `${id} - ${code.name[i18n.language]}`,
              value: codeListId === 'UNECERec21' ? `X${id}` : id, // BR-CL-23
            })),
            style: notEditable && {display: 'none'},
          }))}
          value={value}
          onChange={onChange}
          errorMessage={error}
          onFocus={(e) => notEditable && e.target.blur()}
          style={{width: '100%'}}
          id={id}
        />
      )
    default:
      return (
        <Input
          value={value}
          onChange={onChange}
          errorMessage={error}
          onFocus={(e) => notEditable && e.target.blur()}
          id={id}
        />
      )
  }
}
