import './Filters.css'
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {Accordion, Button, Card, Form, FormCheck, InputGroup} from 'react-bootstrap'
import {withTranslation} from 'react-i18next'
import {get} from 'lodash'
import {invoiceFormats} from '../../utils/constants'
import {isInvoicesFilterValid, keepDigitsOnly} from '../../utils/validations'
import {setData, toggleField} from '../../actions/common'

const Filters = ({
  changeFilter, CustomFilter, formats, getInvoices, ico, searchDisabled, t, test, toggleFilter,
}) => (
  <Accordion>
    <Card>
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
                <strong className="filter-heading">{t('format')}</strong>
                <div className="d-flex">
                  {Object.values(invoiceFormats).map((format) => (
                    <FormCheck
                      type="checkbox"
                      key={format}
                      checked={formats[format]}
                      onChange={toggleFilter(['formats', format])}
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
                  onChange={toggleFilter(['test'])}
                  label="Test"
                />
              </div>
            </div>
            <div>
              <strong className="filter-heading">IČO</strong>
              <InputGroup style={{width: '140px'}}>
                <Form.Control
                  value={ico.value}
                  onChange={changeFilter(['ico', 'value'])}
                  readOnly={!ico.send}
                />
                <InputGroup.Append>
                  <InputGroup.Checkbox
                    checked={ico.send}
                    onChange={toggleFilter(['ico', 'send'])}
                  />
                </InputGroup.Append>
              </InputGroup>
            </div>
            {CustomFilter && <CustomFilter />}
          </div>
          <div className="d-flex">
            <Button
              variant="primary"
              className="ml-auto"
              onClick={() => getInvoices()}
              disabled={searchDisabled}
            >
              {t('search')}
            </Button>
          </div>
        </Card.Body>
      </Accordion.Collapse>
    </Card>
  </Accordion>
)

export default compose(
  connect(
    (state, {areCustomFilterFieldsValid, path}) => {
      const filters = get(state, path)
      return {
        ...filters,
        searchDisabled: !isInvoicesFilterValid(filters) || !areCustomFilterFieldsValid(filters),
      }
    },
    (dispatch, {path}) => ({
      toggleFilter: (fieldPath) => () => dispatch(toggleField([...path, ...fieldPath])),
      changeFilter: (fieldPath) => (e) => dispatch(
        setData([...path, ...fieldPath])(keepDigitsOnly(e.target.value))
      ),
    })
  ),
  withTranslation('common')
)(Filters)
