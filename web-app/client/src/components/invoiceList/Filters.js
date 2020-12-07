import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {Accordion, Button, Card, FormCheck} from 'react-bootstrap'
import {withTranslation} from 'react-i18next'
import {get} from 'lodash'
import {invoiceFormats} from '../../utils/constants'
import {isInvoicesFilterValid} from '../../utils/validations'
import {toggleField} from '../../actions/common'

const Filters = ({CustomFilter, formats, getInvoices, searchDisabled, t, toggleFormatFilter}) => (
  <Accordion>
    <Card style={{textAlign: 'left'}}>
      <Accordion.Toggle
        as={Card.Header}
        eventKey="0"
        className="bg-primary text-white"
        style={{cursor: 'pointer'}}
      >
        {t('filters')}
      </Accordion.Toggle>
      <Accordion.Collapse eventKey="0">
        <Card.Body>
          <div>
            <strong style={{textDecoration: 'underline', fontSize: '20px'}}>{t('format')}</strong>
            <div style={{display: 'flex'}}>
              {Object.values(invoiceFormats).map((format) => (
                <FormCheck
                  type="checkbox"
                  key={format}
                  checked={formats[format]}
                  onChange={() => toggleFormatFilter(format)}
                  label={format}
                  style={{marginRight: '15px'}}
                />
              ))}
            </div>
            {CustomFilter && <CustomFilter />}
          </div>
          <div style={{display: 'flex'}}>
            <Button
              variant="primary"
              style={{marginLeft: 'auto'}}
              onClick={getInvoices}
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
      toggleFormatFilter: (format) => dispatch(toggleField([...path, 'formats', format])),
    })
  ),
  withTranslation('common')
)(Filters)
