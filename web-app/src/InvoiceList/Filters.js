import './Filters.css'
import {useCallback, useEffect, useState} from 'react'
import {useHistory, useLocation} from 'react-router'
import {Accordion, Button, Card, Form, FormCheck, InputGroup} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'
import {invoiceFormats} from '../utils/constants'
import {isInvoicesFilterValid, keepDigitsOnly} from '../utils/validations'

export default ({areCustomFilterFieldsValid, CustomFilter, getInvoices}) => {
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

  const [ico, setIco] = useState(queryParams.get('ico'))
  // Rest of query params passed to CustomFilter
  const initExtraQuery = new URLSearchParams(search)
  initExtraQuery.delete('ico')
  initExtraQuery.delete('format')
  initExtraQuery.delete('test')
  const [extraQuery, setExtraQuery] = useState(initExtraQuery)

  // Triggering search with new filters is done by redirect
  // Page itself is responsible to fetch proper data
  const filterRedirect = useCallback(
    () => {
      const newQueryParams = new URLSearchParams(extraQuery)
      if (test) newQueryParams.set('test', 'true')
      for (const [format, {value}] of Object.entries(formats)) {
        if (value) newQueryParams.append('format', format)
      }
      if (ico != null) newQueryParams.set('ico', ico)

      history.push(`${pathname}?${newQueryParams}`)
    },
    [extraQuery, history, ico, pathname, test, ...Object.values(formats).map(({value}) => value)]
  )

  const searchEnabled = isInvoicesFilterValid({formats, ico}) &&
    areCustomFilterFieldsValid(extraQuery)

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
            <div className="d-flex">
              <div style={{flex: 1}}>
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
              </div>
              <div style={{flex: 1}}>
                <strong className="filter-heading">Test</strong>
                <FormCheck
                  type="checkbox"
                  checked={test}
                  onChange={() => setTest((v) => !v)}
                  label="Test"
                />
              </div>
            </div>
            <div>
              <strong className="filter-heading">IČO</strong>
              <InputGroup style={{width: '140px'}}>
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
            </div>
            {CustomFilter &&
              <CustomFilter extraQuery={extraQuery} setExtraQuery={setExtraQuery} />
            }
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
