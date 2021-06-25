import {useSelector} from 'react-redux'
import {useTranslation} from 'react-i18next'
import {formFieldSelector} from '../state'
import {businessTermLink, getDoc} from './helpers'
import {Field} from '../Field'

const Category = ({docs, path, index}) => {
  const {t} = useTranslation('form')

  return (
    <div>
      <div className="govuk-heading-s">{t('recapitulationCategory', {index})} ({businessTermLink('BG-23')})</div>
      <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs,
              ['cac:TaxTotal', 'cac:TaxSubtotal', 'cac:TaxCategory', 'cbc:ID']
            )}
            label={t('taxCategory')}
            path={[...path, 'key', 'taxCategory']}
            notEditable
            nullable
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs,
              ['cac:TaxTotal', 'cac:TaxSubtotal', 'cac:TaxCategory', 'cbc:Percent']
            )}
            label={t('categoryTaxPercentage')}
            path={[...path, 'key', 'taxPercentage']}
            notEditable
            nullable
          />
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs,
              ['cac:TaxTotal', 'cac:TaxSubtotal', 'cbc:TaxableAmount']
            )}
            label={t('categoryTaxBase')}
            path={[...path, 'amountWithoutVat']}
            notEditable
            nullable
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs,
              ['cac:TaxTotal', 'cac:TaxSubtotal', 'cbc:TaxAmount']
            )}
            label={t('categoryVat')}
            path={[...path, 'vat']}
            notEditable
            nullable
          />
        </div>
      </div>
    </div>
  )
}

export default ({path, docs, formType}) => {
  const taxSubtotals = useSelector(formFieldSelector([...path, 'taxSubtotals'])) || []
  const {t} = useTranslation('form')

  return (
    <div>
      <div className="govuk-heading-l">{t('recapitulation')}</div>
      {Object.entries(taxSubtotals).map(([index, subtotal]) => (
        <Category
          key={index}
          path={[...path, 'taxSubtotals', index]}
          docs={docs}
          formType={formType}
          index={parseInt(index, 10) + 1}
        />
      ))}
      <div>
        <div className="govuk-heading-s">{t('recapitulationFull')} ({businessTermLink('BG-22')})</div>
        <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-half">
            <Field
              docs={getDoc(docs,
                ['cac:LegalMonetaryTotal', 'cbc:TaxExclusiveAmount'])}
              label={t('taxBase')}
              path={[...path, 'amountWithoutVat']}
              notEditable
              nullable
            />
          </div>
          <div className="govuk-grid-column-one-half">
            <Field
              docs={getDoc(docs,
                ['cac:TaxTotal', 'cbc:TaxAmount']
              )}
              label={t('vat')}
              path={[...path, 'vat']}
              notEditable
              nullable
            />
          </div>
        </div>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-half">
            <Field
              docs={getDoc(docs,
                ['cac:LegalMonetaryTotal', 'cbc:TaxInclusiveAmount']
              )}
              label={t('amount')}
              path={[...path, 'amount']}
              notEditable
              nullable
            />
          </div>
          <div className="govuk-grid-column-one-half">
            <Field
              docs={getDoc(docs,
                ['cac:LegalMonetaryTotal', 'cbc:PayableAmount']
              )}
              label={t('totalToPay')}
              path={[...path, 'amount']}
              notEditable
              nullable
            />
          </div>
        </div>
      </div>
    </div>
  )
}
