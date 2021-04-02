import './Filters.css'
import {useCallback, useEffect, useState} from 'react'
import {useHistory, useLocation} from 'react-router'
import {useTranslation} from 'react-i18next'
import {Accordion, Button, Card, Col, Form, FormCheck, InputGroup, Row} from 'react-bootstrap'
import DatePicker from '../helpers/DatePicker'
import {invoiceFormats, orderingTypes} from '../utils/constants'
import {formatDate, formatTime, parseTime} from '../utils/helpers'
import {isInvoicesFilterValid, keepDigitsOnly, keepFloatCharactersOnly} from '../utils/validations'
import {areCodeListsLoadedSelector, codeListsSelector} from '../cache/documentation/state'
import {useDispatch, useSelector} from 'react-redux'
import {getCodeLists} from '../cache/documentation/actions'

export default ({getInvoices}) => {
  const {t} = useTranslation('common')
  const history = useHistory()
  const {pathname, search} = useLocation()
  const queryParams = new URLSearchParams(search)

  const isCodeListLoaded = useSelector(areCodeListsLoadedSelector)
  const codeLists = useSelector(codeListsSelector)
  const dispatch = useDispatch()

  useEffect(() => {
    if (!isCodeListLoaded) {
      dispatch(getCodeLists())
    }
  }, [dispatch, isCodeListLoaded])

  const [test, setTest] = useState(queryParams.get('test') === 'true')

  const [ublFormat, setUblFormat] = useState(queryParams.getAll('format').includes(invoiceFormats.UBL))
  const [d16bFormat, setD16bFormat] = useState(queryParams.getAll('format').includes(invoiceFormats.D16B))

  const [ordering, setOrdering] = useState(
    queryParams.get('order') === orderingTypes.ASC ? orderingTypes.ASC : orderingTypes.DESC
  )

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
      issueDateFrom, issueDateTo, uploadTimeFrom, uploadTimeTo,
      ublFormat, d16bFormat, customerName, supplierName, customerIco, supplierIco,
    ],
  )

  const searchEnabled = isInvoicesFilterValid({
    ublFormat, d16bFormat, ordering, amountFrom, amountTo, amountCurrency,
    amountWithoutVatFrom, amountWithoutVatTo, amountWithoutVatCurrency,
    issueDateFrom, issueDateTo, uploadTimeFrom, uploadTimeTo, customerIco, supplierIco, codeLists,
  })

  // When query URL parameters change try to fetch proper data
  useEffect(() => {
    getInvoices(search)
  }, [search])

  return (
    <Accordion as={Card}>
      <Accordion.Toggle
        as={Card.Header}
        eventKey="0"
        className="bg-primary text-white d-flex align-items-center"
        style={{cursor: 'pointer'}}
      >
        <span>{t('filters')}</span>
        <i className="fas fa-plus ml-auto" />
      </Accordion.Toggle>
      <Accordion.Collapse eventKey="0">
        <Card.Body>
          <div>
            <Row>
              <Col sm>
                <strong className="filter-heading">{t('invoice.format')}</strong>
                <div className="d-flex">
                  <FormCheck
                    type="checkbox"
                    checked={ublFormat}
                    onChange={() => setUblFormat(!ublFormat)}
                    label={invoiceFormats.UBL}
                    className="mr-3"
                  />
                  <FormCheck
                    type="checkbox"
                    checked={d16bFormat}
                    onChange={() => setD16bFormat(!d16bFormat)}
                    label={invoiceFormats.D16B}
                  />
                </div>
              </Col>
              <Col sm>
                <strong className="filter-heading">Test</strong>
                <FormCheck
                  type="checkbox"
                  checked={test}
                  onChange={() => setTest((v) => !v)}
                  label="Test"
                />
              </Col>
            </Row>
            <Row>
              <Col md>
                <strong className="filter-heading">{t('invoice.orderFrom')}</strong>
                <Form.Control
                  as="select"
                  style={{maxWidth: '150px'}}
                  value={ordering}
                  onChange={(e) => setOrdering(e.target.value)}
                >
                  <option value={orderingTypes.DESC}>{t('invoice.newest')}</option>
                  <option value={orderingTypes.ASC}>{t('invoice.oldest')}</option>
                </Form.Control>
              </Col>
            </Row>
            <Row>
              <Col md>
                <strong className="filter-heading">{t('invoice.supplierIco')}</strong>
                <InputGroup style={{maxWidth: '140px'}}>
                  <Form.Control
                    value={supplierIco || ''}
                    onChange={(e) => setSupplierIco(keepDigitsOnly(e.target.value))}
                    readOnly={supplierIco == null}
                  />
                  <InputGroup.Append>
                    <InputGroup.Checkbox
                      checked={supplierIco != null}
                      onChange={() => setSupplierIco(supplierIco == null ? '' : null)}
                    />
                  </InputGroup.Append>
                </InputGroup>
              </Col>
              <Col md>
                <strong className="filter-heading">{t('invoice.customerIco')}</strong>
                <InputGroup style={{maxWidth: '140px'}}>
                  <Form.Control
                    value={customerIco || ''}
                    onChange={(e) => setCustomerIco(keepDigitsOnly(e.target.value))}
                    readOnly={customerIco == null}
                  />
                  <InputGroup.Append>
                    <InputGroup.Checkbox
                      checked={customerIco != null}
                      onChange={() => setCustomerIco(customerIco == null ? '' : null)}
                    />
                  </InputGroup.Append>
                </InputGroup>
              </Col>
            </Row>
            <Row>
              <Col md>
                <strong className="filter-heading">{t('invoice.supplier')}</strong>
                <InputGroup style={{maxWidth: '230px'}}>
                  <Form.Control
                    value={supplierName || ''}
                    onChange={(e) => setSupplierName(e.target.value)}
                    readOnly={supplierName == null}
                  />
                  <InputGroup.Append>
                    <InputGroup.Checkbox
                      checked={supplierName != null}
                      onChange={() => setSupplierName(supplierName == null ? '' : null)}
                    />
                  </InputGroup.Append>
                </InputGroup>
              </Col>
              <Col md>
                <strong className="filter-heading">{t('invoice.customer')}</strong>
                <InputGroup style={{maxWidth: '230px'}}>
                  <Form.Control
                    value={customerName || ''}
                    onChange={(e) => setCustomerName(e.target.value)}
                    readOnly={customerName == null}
                  />
                  <InputGroup.Append>
                    <InputGroup.Checkbox
                      checked={customerName != null}
                      onChange={() => setCustomerName(customerName == null ? '' : null)}
                    />
                  </InputGroup.Append>
                </InputGroup>
              </Col>
            </Row>
            <Row>
              <Col md>
                <strong className="filter-heading">{t('invoice.amount')}</strong>
                <InputGroup>
                  <Form.Label style={{width: '70px'}}>{t('invoice.intervalStart')}</Form.Label>
                  <Form.Control
                    style={{maxWidth: '150px'}}
                    value={amountFrom || ''}
                    onChange={(e) => setAmountFrom(keepFloatCharactersOnly(e.target.value))}
                    readOnly={amountFrom == null}
                  />
                  <InputGroup.Append>
                    <InputGroup.Checkbox
                      checked={amountFrom != null}
                      onChange={() => setAmountFrom(amountFrom == null ? '' : null)}
                    />
                  </InputGroup.Append>
                </InputGroup>
                <InputGroup>
                  <Form.Label style={{width: '70px'}}>{t('invoice.intervalEnd')}</Form.Label>
                  <Form.Control
                    style={{maxWidth: '150px'}}
                    value={amountTo || ''}
                    onChange={(e) => setAmountTo(keepFloatCharactersOnly(e.target.value))}
                    readOnly={amountTo == null}
                  />
                  <InputGroup.Append>
                    <InputGroup.Checkbox
                      checked={amountTo != null}
                      onChange={() => setAmountTo(amountTo == null ? '' : null)}
                    />
                  </InputGroup.Append>
                </InputGroup>
                {isCodeListLoaded && <InputGroup>
                  <Form.Label style={{width: '70px'}}>{t('invoice.currency')}</Form.Label>
                  <Form.Control
                    as="select"
                    style={{maxWidth: '150px'}}
                    value={amountCurrency || ''}
                    onChange={(e) => setAmountCurrency(e.target.value)}
                    disabled={amountCurrency == null}
                  >
                    <option />
                    {codeLists && Object.keys(codeLists.ISO4217.codes).map((code, i) => (
                      <option key={i} value={code}>{code}</option>
                    ))}
                  </Form.Control>
                  <InputGroup.Append>
                    <InputGroup.Checkbox
                      checked={amountCurrency != null}
                      onChange={() => setAmountCurrency(amountCurrency == null ? '' : null)}
                    />
                  </InputGroup.Append>
                </InputGroup>}
              </Col>
              <Col md>
                <strong className="filter-heading">{t('invoice.amountWithoutVat')}</strong>
                <InputGroup>
                  <Form.Label style={{width: '70px'}}>{t('invoice.intervalStart')}</Form.Label>
                  <Form.Control
                    style={{maxWidth: '150px'}}
                    value={amountWithoutVatFrom || ''}
                    onChange={
                      (e) => setAmountWithoutVatFrom(keepFloatCharactersOnly(e.target.value))
                    }
                    readOnly={amountWithoutVatFrom == null}
                  />
                  <InputGroup.Append>
                    <InputGroup.Checkbox
                      checked={amountWithoutVatFrom != null}
                      onChange={() => setAmountWithoutVatFrom(amountWithoutVatFrom == null ? '' : null)}
                    />
                  </InputGroup.Append>
                </InputGroup>
                <InputGroup>
                  <Form.Label style={{width: '70px'}}>{t('invoice.intervalEnd')}</Form.Label>
                  <Form.Control
                    style={{maxWidth: '150px'}}
                    value={amountWithoutVatTo || ''}
                    onChange={(e) => setAmountWithoutVatTo(keepFloatCharactersOnly(e.target.value))}
                    readOnly={amountWithoutVatTo == null}
                  />
                  <InputGroup.Append>
                    <InputGroup.Checkbox
                      checked={amountWithoutVatTo != null}
                      onChange={() => setAmountWithoutVatTo(amountWithoutVatTo == null ? '' : null)}
                    />
                  </InputGroup.Append>
                </InputGroup>
                {isCodeListLoaded && <InputGroup>
                  <Form.Label style={{width: '70px'}}>{t('invoice.currency')}</Form.Label>
                  <Form.Control
                    as="select"
                    style={{maxWidth: '150px'}}
                    value={amountWithoutVatCurrency || ''}
                    onChange={(e) => setAmountWithoutVatCurrency(e.target.value)}
                    disabled={amountWithoutVatCurrency == null}
                  >
                    <option />
                    {codeLists && Object.keys(codeLists.ISO4217.codes).map((code, i) => (
                      <option key={i} value={code}>{code}</option>
                    ))}
                  </Form.Control>
                  <InputGroup.Append>
                    <InputGroup.Checkbox
                      checked={amountWithoutVatCurrency != null}
                      onChange={() => setAmountWithoutVatCurrency(amountWithoutVatCurrency == null ? '' : null)}
                    />
                  </InputGroup.Append>
                </InputGroup>}
              </Col>
            </Row>
            <Row>
              <Col md>
                <strong className="filter-heading">{t('invoice.issueDate')}</strong>
                <InputGroup>
                  <Form.Label style={{width: '40px'}}>{t('invoice.intervalStart')}</Form.Label>
                  <DatePicker
                    className="datepicker-width"
                    selected={issueDateFrom || ''}
                    onChange={setIssueDateFrom}
                    disabled={issueDateFrom == null}
                    dateFormat="P"
                  />
                  <InputGroup.Append>
                    <InputGroup.Checkbox
                      checked={issueDateFrom != null}
                      onChange={() => setIssueDateFrom(issueDateFrom == null ? '' : null)}
                    />
                  </InputGroup.Append>
                </InputGroup>
                <InputGroup>
                  <Form.Label style={{width: '40px'}}>{t('invoice.intervalEnd')}</Form.Label>
                  <DatePicker
                    className="datepicker-width"
                    selected={issueDateTo || ''}
                    onChange={setIssueDateTo}
                    disabled={issueDateTo == null}
                    dateFormat="P"
                  />
                  <InputGroup.Append>
                    <InputGroup.Checkbox
                      checked={issueDateTo != null}
                      onChange={() => setIssueDateTo(issueDateTo == null ? '' : null)}
                    />
                  </InputGroup.Append>
                </InputGroup>
              </Col>
              <Col md>
                <strong className="filter-heading">{t('invoice.uploadTime')}</strong>
                <InputGroup>
                  <Form.Label style={{width: '40px'}}>{t('invoice.intervalStart')}</Form.Label>
                  <DatePicker
                    className="datepicker-width"
                    selected={uploadTimeFrom || ''}
                    onChange={setUploadTimeFrom}
                    disabled={uploadTimeFrom == null}
                    showTimeSelect
                    dateFormat="Pp"
                    maxDate={new Date()}
                    timeCaption={t('time')}
                  />
                  <InputGroup.Append>
                    <InputGroup.Checkbox
                      checked={uploadTimeFrom != null}
                      onChange={() => setUploadTimeFrom(uploadTimeFrom == null ? '' : null)}
                    />
                  </InputGroup.Append>
                </InputGroup>
                <InputGroup>
                  <Form.Label style={{width: '40px'}}>{t('invoice.intervalEnd')}</Form.Label>
                  <DatePicker
                    className="datepicker-width"
                    selected={uploadTimeTo || ''}
                    onChange={setUploadTimeTo}
                    disabled={uploadTimeTo == null}
                    showTimeSelect
                    dateFormat="Pp"
                    maxDate={new Date()}
                    timeCaption={t('time')}
                  />
                  <InputGroup.Append>
                    <InputGroup.Checkbox
                      checked={uploadTimeTo != null}
                      onChange={() => setUploadTimeTo(uploadTimeTo == null ? '' : null)}
                    />
                  </InputGroup.Append>
                </InputGroup>
              </Col>
            </Row>
          </div>
          <div className="d-flex">
            <Button
              variant="primary"
              className="ml-auto"
              onClick={filterRedirect}
              disabled={!searchEnabled}
            >
              {t('search')}
            </Button>
          </div>
        </Card.Body>
      </Accordion.Collapse>
    </Accordion>
  )
}
