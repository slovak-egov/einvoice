import './Filters.css'
import {useCallback, useEffect, useState} from 'react'
import {useHistory, useLocation} from 'react-router'
import {Accordion, Button, Card, Col, Form, FormCheck, InputGroup, Row} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'
import {invoiceFormats} from '../utils/constants'
import {isInvoicesFilterValid, keepDigitsOnly, keepFloatCharactersOnly} from '../utils/validations'

export default ({getInvoices}) => {
  const {t} = useTranslation('common')
  const history = useHistory()
  const {pathname, search} = useLocation()
  const queryParams = new URLSearchParams(search)

  const [test, setTest] = useState(queryParams.get('test') === 'true')

  const formats = {}
  for (const format of Object.values(invoiceFormats)) {
    const [value, setter] = useState(queryParams.getAll('format').includes(format))
    formats[format] = {value, setter, toggleFormat: () => setter((v) => !v)}
  }

  const [amountFrom, setAmountFrom] = useState(queryParams.get('amountFrom'))
  const [amountTo, setAmountTo] = useState(queryParams.get('amountTo'))
  const [amountWithoutVatFrom, setAmountWithoutVatFrom] = useState(queryParams.get('amountWithoutVatFrom'))
  const [amountWithoutVatTo, setAmountWithoutVatTo] = useState(queryParams.get('amountWithoutVatTo'))

  const [ico, setIco] = useState(queryParams.get('ico'))

  // Triggering search with new filters is done by redirect
  // Page itself is responsible to fetch proper data
  const filterRedirect = useCallback(
    () => {
      const newQueryParams = new URLSearchParams()
      if (test) newQueryParams.set('test', 'true')
      for (const [format, {value}] of Object.entries(formats)) {
        if (value) newQueryParams.append('format', format)
      }
      if (ico != null) newQueryParams.set('ico', ico)
      if (amountFrom != null) newQueryParams.set('amountFrom', amountFrom)
      if (amountTo != null) newQueryParams.set('amountTo', amountTo)
      if (amountWithoutVatFrom != null) newQueryParams.set('amountWithoutVatFrom', amountWithoutVatFrom)
      if (amountWithoutVatTo != null) newQueryParams.set('amountWithoutVatTo', amountWithoutVatTo)

      history.push(`${pathname}?${newQueryParams}`)
    },
    [
      history, ico, pathname, test, amountFrom, amountTo, amountWithoutVatFrom,
      amountWithoutVatTo, ...Object.values(formats).map(({value}) => value),
    ],
  )

  const searchEnabled = isInvoicesFilterValid({
    formats, ico, amountFrom, amountTo, amountWithoutVatFrom, amountWithoutVatTo,
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
                  {Object.values(invoiceFormats).map((format) => (
                    <FormCheck
                      type="checkbox"
                      key={format}
                      checked={formats[format].value}
                      onChange={formats[format].toggleFormat}
                      label={format}
                      className="mr-3"
                    />
                  ))}
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
                <strong className="filter-heading">{t('invoice.amount')}</strong>
                <InputGroup>
                  <Form.Label style={{width: '40px'}}>{t('invoice.amountFrom')}</Form.Label>
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
                  <Form.Label style={{width: '40px'}}>{t('invoice.amountTo')}</Form.Label>
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
                  <Form.Label style={{width: '40px'}}>{t('invoice.amountFrom')}</Form.Label>
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
                  <Form.Label style={{width: '40px'}}>{t('invoice.amountTo')}</Form.Label>
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
