import './Filters.css'
import {useCallback, useEffect, useState} from 'react'
import {useHistory, useLocation} from 'react-router'
import {useTranslation} from 'react-i18next'
import {Accordion, Button, Card, Col, Form, FormCheck, InputGroup, Row} from 'react-bootstrap'
import DatePicker from '../helpers/DatePicker'
import {invoiceFormats} from '../utils/constants'
import {formatDate, formatTime, parseTime} from '../utils/helpers'
import {isInvoicesFilterValid, keepDigitsOnly, keepFloatCharactersOnly} from '../utils/validations'

export default ({getInvoices}) => {
  const {t} = useTranslation('common')
  const history = useHistory()
  const {pathname, search} = useLocation()
  const queryParams = new URLSearchParams(search)

  const [test, setTest] = useState(queryParams.get('test') === 'true')

  const [ublFormat, setUblFormat] = useState(queryParams.getAll('format').includes(invoiceFormats.UBL))
  const [d16bFormat, setD16bFormat] = useState(queryParams.getAll('format').includes(invoiceFormats.D16B))

  const [amountFrom, setAmountFrom] = useState(queryParams.get('amountFrom'))
  const [amountTo, setAmountTo] = useState(queryParams.get('amountTo'))
  const [amountWithoutVatFrom, setAmountWithoutVatFrom] = useState(queryParams.get('amountWithoutVatFrom'))
  const [amountWithoutVatTo, setAmountWithoutVatTo] = useState(queryParams.get('amountWithoutVatTo'))

  const [issueDateFrom, setIssueDateFrom] = useState(parseTime(queryParams.get('issueDateFrom')))
  const [issueDateTo, setIssueDateTo] = useState(parseTime(queryParams.get('issueDateTo')))
  const [uploadTimeFrom, setUploadTimeFrom] = useState(parseTime(queryParams.get('uploadTimeFrom')))
  const [uploadTimeTo, setUploadTimeTo] = useState(parseTime(queryParams.get('uploadTimeTo')))

  const [customerName, setCustomerName] = useState(queryParams.get('customerName'))
  const [supplierName, setSupplierName] = useState(queryParams.get('supplierName'))

  const [ico, setIco] = useState(queryParams.get('ico'))

  // Triggering search with new filters is done by redirect
  // Page itself is responsible to fetch proper data
  const filterRedirect = useCallback(
    () => {
      const newQueryParams = new URLSearchParams()
      if (test) newQueryParams.set('test', 'true')

      if (ublFormat) newQueryParams.append('format', invoiceFormats.UBL)
      if (d16bFormat) newQueryParams.append('format', invoiceFormats.D16B)

      if (ico != null) newQueryParams.set('ico', ico)
      if (amountFrom != null) newQueryParams.set('amountFrom', amountFrom)
      if (amountTo != null) newQueryParams.set('amountTo', amountTo)
      if (amountWithoutVatFrom != null) newQueryParams.set('amountWithoutVatFrom', amountWithoutVatFrom)
      if (amountWithoutVatTo != null) newQueryParams.set('amountWithoutVatTo', amountWithoutVatTo)

      if (issueDateFrom != null) newQueryParams.set('issueDateFrom', formatDate(issueDateFrom))
      if (issueDateTo != null) newQueryParams.set('issueDateTo', formatDate(issueDateTo))
      if (uploadTimeFrom != null) newQueryParams.set('uploadTimeFrom', formatTime(uploadTimeFrom))
      if (uploadTimeTo != null) newQueryParams.set('uploadTimeTo', formatTime(uploadTimeTo))

      if (customerName != null) newQueryParams.set('customerName', customerName)
      if (supplierName != null) newQueryParams.set('supplierName', supplierName)

      history.push(`${pathname}?${newQueryParams}`)
    },
    [
      history, ico, pathname, test, amountFrom, amountTo, amountWithoutVatFrom, amountWithoutVatTo,
      issueDateFrom, issueDateTo, uploadTimeFrom, uploadTimeTo, ublFormat, d16bFormat,
      customerName, supplierName,
    ],
  )

  const searchEnabled = isInvoicesFilterValid({
    ublFormat, d16bFormat, ico, amountFrom, amountTo, amountWithoutVatFrom, amountWithoutVatTo,
    issueDateFrom, issueDateTo, uploadTimeFrom, uploadTimeTo,
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
              <Col>
                <strong className="filter-heading">IČO</strong>
                <InputGroup style={{maxWidth: '140px'}}>
                  <Form.Control
                    value={ico || ''}
                    onChange={(e) => setIco(keepDigitsOnly(e.target.value))}
                    readOnly={ico == null}
                  />
                  <InputGroup.Append>
                    <InputGroup.Checkbox
                      checked={ico != null}
                      onChange={() => setIco(ico == null ? '' : null)}
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
                  <Form.Label style={{width: '40px'}}>{t('invoice.intervalStart')}</Form.Label>
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
                  <Form.Label style={{width: '40px'}}>{t('invoice.intervalEnd')}</Form.Label>
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
              </Col>
              <Col md>
                <strong className="filter-heading">{t('invoice.amountWithoutVat')}</strong>
                <InputGroup>
                  <Form.Label style={{width: '40px'}}>{t('invoice.intervalStart')}</Form.Label>
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
                  <Form.Label style={{width: '40px'}}>{t('invoice.intervalEnd')}</Form.Label>
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
