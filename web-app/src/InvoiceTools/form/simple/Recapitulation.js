import {useDispatch, useSelector} from 'react-redux'
import {useTranslation} from 'react-i18next'
import {useEffect} from 'react'
import {formFieldSelector, formItemsSelector} from '../state'
import {setFormField} from '../actions'
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
            disabled
            nullable
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs,
              ['cac:TaxTotal', 'cac:TaxSubtotal', 'cac:TaxCategory', 'cbc:Percent']
            )}
            label={t('taxPercentage')}
            path={[...path, 'key', 'taxPercentage']}
            disabled
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
            label={t('taxBase')}
            path={[...path, 'amountWithoutVat']}
            disabled
            nullable
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs,
              ['cac:TaxTotal', 'cac:TaxSubtotal', 'cbc:TaxAmount']
            )}
            label={t('vat')}
            path={[...path, 'vat']}
            disabled
            nullable
          />
        </div>
      </div>
    </div>
  )
}

export default ({path, docs, formType}) => {
  const dispatch = useDispatch()
  const items = useSelector(formItemsSelector(formType))
  const recapitulationChange = useSelector(formFieldSelector([...path, 'recapitulationChange']))
  const taxSubtotals = useSelector(formFieldSelector([...path, 'taxSubtotals'])) || []
  const {t} = useTranslation('form')

  useEffect(() => {
    const subtotals = {}
    let newAmountWithoutVat = 0
    let newVat = 0
    let newAmount = 0

    Object.values(items).forEach((item) => {
      const key = ({
        taxCategory: item.taxCategory,
        taxPercentage: item.taxPercentage || '0.00',
        taxExemptionCode: item.taxExemptionCode,
        taxExemptionReason: item.taxExemptionReason,
      })
      const keyString = JSON.stringify(key)
      const subtotal = subtotals[keyString] || {
        amountWithoutVat: Number(0),
        vat: Number(0),
        amount: Number(0),
      }

      if (Number(item.amountWithoutVat)) {
        subtotal.amountWithoutVat += Number(item.amountWithoutVat)
        newAmountWithoutVat += Number(item.amountWithoutVat)
      }
      if (Number(item.vat)) {
        subtotal.vat += Number(item.vat)
        newVat += Number(item.vat)
      }
      if (Number(item.amount)) {
        subtotal.amount += Number(item.amount)
        newAmount += Number(item.amount)
      }

      subtotals[keyString] = {...subtotal, key}
    })

    const res = {}
    Object.values(subtotals).forEach((subtotal, index) => (
      res[index] = {
        key: subtotal.key,
        amountWithoutVat: subtotal.amountWithoutVat.toFixed(2),
        vat: subtotal.vat.toFixed(2),
        amount: subtotal.amount.toFixed(2),
      }
    ))

    dispatch(setFormField([...path, 'amountWithoutVat'])(newAmountWithoutVat.toFixed(2)))
    dispatch(setFormField([...path, 'vat'])(newVat.toFixed(2)))
    dispatch(setFormField([...path, 'amount'])(newAmount.toFixed(2)))

    dispatch(setFormField([...path, 'taxSubtotals'])(res))
    dispatch(setFormField([...path, 'recapitulationChange'])(false))
  }, [recapitulationChange])

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
              disabled
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
              disabled
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
              disabled
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
              disabled
              nullable
            />
          </div>
        </div>
      </div>
    </div>
  )
}
