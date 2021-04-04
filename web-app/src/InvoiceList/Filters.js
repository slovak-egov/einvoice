import {useCallback, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useHistory, useLocation} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {identity} from 'lodash'
import {Accordion, Button, Checkboxes, Input, Select} from '../helpers/idsk'
import DatePicker from '../helpers/DatePicker'
import {areCodeListsLoadedSelector, currencyListSelector} from '../cache/documentation/state'
import {getCodeLists} from '../cache/documentation/actions'
import {invoiceFormats, orderingTypes} from '../utils/constants'
import {formatDate, formatTime, parseTime} from '../utils/helpers'
import {isInvoicesFilterValid, keepDigitsOnly, keepFloatCharactersOnly} from '../utils/validations'

const FilterField = ({items, processInput = identity, setValue, type, value, ...props}) => {
  switch (type) {
    case 'input':
      return (
        <Input
          className="govuk-input--width-10"
          value={value || ''}
          onChange={(e) => setValue(processInput(e.target.value))}
          type="text"
          {...props}
        />
      )
    case 'datepicker':
      return (
        <DatePicker
          className="govuk-input--width-10"
          selected={value}
          onChange={setValue}
          {...props}
        />
      )
    case 'select':
      return (
        <Select
          value={value}
          onChange={(e) => setValue(e.target.value)}
          items={items}
        />
      )
    default:
      return null
  }
}

const ConditionalFilter = ({items, name, title}) => (
  <Checkboxes
    className="govuk-checkboxes--small"
    fieldset={{legend: {children: title}}}
    name={`filter-${name}-checkbox`}
    items={items.map((item) => ({
      checked: item.value != null,
      onChange: () => item.setValue(item.value == null ? '' : null),
      children: item.title,
      conditional: {
        children: (
          <FilterField value={item.value} setValue={item.setValue} {...item.childrenProps} />
        ),
      },
    }))}
  />
)

export default ({getInvoices}) => {
  const {i18n, t} = useTranslation('common')
  const history = useHistory()
  const {pathname, search} = useLocation()
  const queryParams = new URLSearchParams(search)

  const areCodeListsLoaded = useSelector(areCodeListsLoadedSelector)
  const currencyList = useSelector(currencyListSelector)
  const dispatch = useDispatch()

  useEffect(() => {
    if (!areCodeListsLoaded) {
      dispatch(getCodeLists())
    }
  }, [dispatch, areCodeListsLoaded])

  const [test, setTest] = useState(queryParams.get('test') === 'true')

  const [ublFormat, setUblFormat] = useState(queryParams.getAll('format').includes(invoiceFormats.UBL))
  const [d16bFormat, setD16bFormat] = useState(queryParams.getAll('format').includes(invoiceFormats.D16B))

  const [ordering, setOrdering] = useState(queryParams.get('order') || orderingTypes.DESC)

  const [amountFrom, setAmountFrom] = useState(queryParams.get('amountFrom'))
  const [amountTo, setAmountTo] = useState(queryParams.get('amountTo'))
  const [amountCurrency, setAmountCurrency] = useState(queryParams.get('amountCurrency'))
  const [amountWithoutVatFrom, setAmountWithoutVatFrom] = useState(queryParams.get('amountWithoutVatFrom'))
  const [amountWithoutVatTo, setAmountWithoutVatTo] = useState(queryParams.get('amountWithoutVatTo'))
  const [amountWithoutVatCurrency, setAmountWithoutVatCurrency] = useState(queryParams.get('amountWithoutVatCurrency'))

  const [issueDateFrom, setIssueDateFrom] = useState(parseTime(queryParams.get('issueDateFrom')))
  const [issueDateTo, setIssueDateTo] = useState(parseTime(queryParams.get('issueDateTo')))
  const [uploadTimeFrom, setUploadTimeFrom] = useState(parseTime(queryParams.get('uploadTimeFrom')))
  const [uploadTimeTo, setUploadTimeTo] = useState(parseTime(queryParams.get('uploadTimeTo')))

  const [customerName, setCustomerName] = useState(queryParams.get('customerName'))
  const [supplierName, setSupplierName] = useState(queryParams.get('supplierName'))
  const [customerIco, setCustomerIco] = useState(queryParams.get('customerIco'))
  const [supplierIco, setSupplierIco] = useState(queryParams.get('supplierIco'))

  // Triggering search with new filters is done by redirect
  // Page itself is responsible to fetch proper data
  const filterRedirect = useCallback(
    () => {
      const newQueryParams = new URLSearchParams()
      if (test) newQueryParams.set('test', 'true')

      if (ublFormat) newQueryParams.append('format', invoiceFormats.UBL)
      if (d16bFormat) newQueryParams.append('format', invoiceFormats.D16B)

      if (ordering != null) newQueryParams.append('order', ordering)

      if (amountFrom != null) newQueryParams.set('amountFrom', amountFrom)
      if (amountTo != null) newQueryParams.set('amountTo', amountTo)
      if (amountCurrency != null) newQueryParams.set('amountCurrency', amountCurrency)
      if (amountWithoutVatFrom != null) newQueryParams.set('amountWithoutVatFrom', amountWithoutVatFrom)
      if (amountWithoutVatTo != null) newQueryParams.set('amountWithoutVatTo', amountWithoutVatTo)
      if (amountWithoutVatCurrency != null) newQueryParams.set('amountWithoutVatCurrency', amountWithoutVatCurrency)

      if (issueDateFrom != null) newQueryParams.set('issueDateFrom', formatDate(issueDateFrom))
      if (issueDateTo != null) newQueryParams.set('issueDateTo', formatDate(issueDateTo))
      if (uploadTimeFrom != null) newQueryParams.set('uploadTimeFrom', formatTime(uploadTimeFrom))
      if (uploadTimeTo != null) newQueryParams.set('uploadTimeTo', formatTime(uploadTimeTo))

      if (customerName != null) newQueryParams.set('customerName', customerName)
      if (supplierName != null) newQueryParams.set('supplierName', supplierName)
      if (customerIco != null) newQueryParams.set('customerIco', customerIco)
      if (supplierIco != null) newQueryParams.set('supplierIco', supplierIco)

      history.push(`${pathname}?${newQueryParams}`)
    },
    [
      history, pathname, test, ordering, amountFrom, amountTo, amountCurrency,
      amountWithoutVatFrom, amountWithoutVatTo, amountWithoutVatCurrency,
      issueDateFrom, issueDateTo, uploadTimeFrom, uploadTimeTo, ublFormat, d16bFormat,
      customerName, supplierName, customerIco, supplierIco,
    ],
  )

  // When query URL parameters change try to fetch proper data
  useEffect(() => {
    getInvoices(search)
  }, [search])

  // Data is loading
  if (!areCodeListsLoaded) return null

  const searchEnabled = isInvoicesFilterValid({
    ublFormat, d16bFormat, amountFrom, amountTo, amountWithoutVatFrom, amountWithoutVatTo,
    issueDateFrom, issueDateTo, uploadTimeFrom, uploadTimeTo, customerIco, supplierIco,
  })

  // Accordion key is important, so React creates new component on language change
  // instead of updating old one.
  // This is because government design (ID-SK) does not like just changing content of components.
  return (
    <Accordion
      key={i18n.language}
      items={[{
        heading: {children: t('filters')},
        content: {children: (
          <>
            <div>
              <div className="govuk-grid-row">
                <div className="govuk-grid-column-one-half">
                  <Checkboxes
                    className="govuk-checkboxes--small"
                    fieldset={{legend: {children: t('invoice.format')}}}
                    errorMessage={!ublFormat && !d16bFormat && {children: t('errorMessages.noneSelected')}}
                    name="filter-format-checkbox"
                    items={[
                      {
                        checked: ublFormat,
                        children: invoiceFormats.UBL,
                        onChange: () => setUblFormat((v) => !v),
                      },
                      {
                        checked: d16bFormat,
                        children: invoiceFormats.D16B,
                        onChange: () => setD16bFormat((v) => !v),
                      },
                    ]}
                  />
                </div>
                <div className="govuk-grid-column-one-half">
                  <Checkboxes
                    className="govuk-checkboxes--small"
                    fieldset={{legend: {children: 'Test'}}}
                    name="filter-test-checkbox"
                    items={[{
                      checked: test,
                      children: 'Test',
                      onChange: () => setTest((v) => !v),
                    }]}
                  />
                </div>
              </div>
              <div className="govuk-grid-row">
                <div className="govuk-grid-column-one-half">
                  <ConditionalFilter
                    title={t('invoice.supplier')}
                    name="supplier"
                    items={[
                      {
                        title: 'IČO',
                        value: supplierIco,
                        setValue: setSupplierIco,
                        childrenProps: {
                          type: 'input',
                          processInput: keepDigitsOnly,
                        },
                      },
                      {
                        title: t('invoiceDocs.name'),
                        value: supplierName,
                        setValue: setSupplierName,
                        childrenProps: {
                          type: 'input',
                        },
                      },
                    ]}
                  />
                </div>
                <div className="govuk-grid-column-one-half">
                  <ConditionalFilter
                    title={t('invoice.customer')}
                    name="customer"
                    items={[
                      {
                        title: 'IČO',
                        value: customerIco,
                        setValue: setCustomerIco,
                        childrenProps: {
                          type: 'input',
                          processInput: keepDigitsOnly,
                        },
                      },
                      {
                        title: t('invoiceDocs.name'),
                        value: customerName,
                        setValue: setCustomerName,
                        childrenProps: {
                          type: 'input',
                        },
                      },
                    ]}
                  />
                </div>
              </div>
              <div className="govuk-grid-row">
                <div className="govuk-grid-column-one-half">
                  <ConditionalFilter
                    title={t('invoice.amount')}
                    name="amount"
                    items={[
                      {
                        title: t('invoice.intervalStart'),
                        value: amountFrom,
                        setValue: setAmountFrom,
                        childrenProps: {
                          type: 'input',
                          processInput: keepFloatCharactersOnly,
                        },
                      },
                      {
                        title: t('invoice.intervalEnd'),
                        value: amountTo,
                        setValue: setAmountTo,
                        childrenProps: {
                          type: 'input',
                          processInput: keepFloatCharactersOnly,
                        },
                      },
                      {
                        title: t('invoice.currency'),
                        value: amountCurrency,
                        setValue: setAmountCurrency,
                        childrenProps: {
                          type: 'select',
                          items: currencyList.map((code) => ({
                            children: code,
                            value: code,
                          })),
                        },
                      },
                    ]}
                  />
                </div>
                <div className="govuk-grid-column-one-half">
                  <ConditionalFilter
                    title={t('invoice.amountWithoutVat')}
                    name="amountWithoutVat"
                    items={[
                      {
                        title: t('invoice.intervalStart'),
                        value: amountWithoutVatFrom,
                        setValue: setAmountWithoutVatFrom,
                        childrenProps: {
                          type: 'input',
                          processInput: keepFloatCharactersOnly,
                        },
                      },
                      {
                        title: t('invoice.intervalEnd'),
                        value: amountWithoutVatTo,
                        setValue: setAmountWithoutVatTo,
                        childrenProps: {
                          type: 'input',
                          processInput: keepFloatCharactersOnly,
                        },
                      },
                      {
                        title: t('invoice.currency'),
                        value: amountWithoutVatCurrency,
                        setValue: setAmountWithoutVatCurrency,
                        childrenProps: {
                          type: 'select',
                          items: currencyList.map((code) => ({
                            children: code,
                            value: code,
                          })),
                        },
                      },
                    ]}
                  />
                </div>
              </div>
              <div className="govuk-grid-row">
                <div className="govuk-grid-column-one-half">
                  <ConditionalFilter
                    title={t('invoice.issueDate')}
                    name="issueDate"
                    items={[
                      {
                        title: t('invoice.intervalStart'),
                        value: issueDateFrom,
                        setValue: setIssueDateFrom,
                        childrenProps: {
                          type: 'datepicker',
                          dateFormat: 'P',
                        },
                      },
                      {
                        title: t('invoice.intervalEnd'),
                        value: issueDateTo,
                        setValue: setIssueDateTo,
                        childrenProps: {
                          type: 'datepicker',
                          dateFormat: 'P',
                        },
                      },
                    ]}
                  />
                </div>
                <div className="govuk-grid-column-one-half">
                  <ConditionalFilter
                    title={t('invoice.uploadTime')}
                    name="uploadTime"
                    items={[
                      {
                        title: t('invoice.intervalStart'),
                        value: uploadTimeFrom,
                        setValue: setUploadTimeFrom,
                        childrenProps: {
                          type: 'datepicker',
                          showTimeSelect: true,
                          dateFormat: 'Pp',
                          maxDate: new Date(),
                          timeCaption: t('time'),
                        },
                      },
                      {
                        title: t('invoice.intervalEnd'),
                        value: uploadTimeTo,
                        setValue: setUploadTimeTo,
                        childrenProps: {
                          type: 'datepicker',
                          showTimeSelect: true,
                          dateFormat: 'Pp',
                          maxDate: new Date(),
                          timeCaption: t('time'),
                        },
                      },
                    ]}
                  />
                </div>
              </div>
              <div className="govuk-grid-row">
                <div className="govuk-grid-column-one-half">
                  <Select
                    label={{children: t('invoice.orderFrom')}}
                    value={ordering}
                    onChange={(e) => setOrdering(e.target.value)}
                    items={[
                      {value: orderingTypes.DESC, children: t('invoice.newest')},
                      {value: orderingTypes.ASC, children: t('invoice.oldest')},
                    ]}
                  />
                </div>
              </div>
            </div>
            <div className="govuk-button-group" style={{justifyContent: 'center'}}>
              <Button
                onClick={filterRedirect}
                disabled={!searchEnabled}
              >
                {t('search')}
              </Button>
            </div>
          </>
        )},
      }]}
    />
  )
}
