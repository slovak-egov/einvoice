import {useTranslation} from 'react-i18next'
import {useDispatch, useSelector} from 'react-redux'
import {useEffect} from 'react'
import {getDoc} from './docs'
import {formFieldSelector, formItemsSelector} from '../state'
import {addItem, removeItem, setFormField} from '../actions'
import {Field} from '../Field'
import {Button} from '../../../helpers/idsk'
import {invoiceComplexities} from '../../../utils/constants'

const Item = ({docs, formType, path, index, number}) => {
  const invoicePath = [formType, invoiceComplexities.SIMPLE]
  const itemPath = [...invoicePath, 'items', index]
  const {t} = useTranslation('form')
  const dispatch = useDispatch()
  const itemQuantity = useSelector(formFieldSelector([...itemPath, 'quantity']))
  const quantityUnitPrice = useSelector(formFieldSelector([...itemPath, 'quantityUnitPrice']))
  const taxPercentage = useSelector(formFieldSelector([...itemPath, 'taxPercentage']))
  const amountWithoutVat = useSelector(formFieldSelector([...itemPath, 'amountWithoutVat']))
  const vat = useSelector(formFieldSelector([...itemPath, 'vat']))

  useEffect(() => {
    dispatch(setFormField([...invoicePath, 'amountWithoutVatChange'])(true))
  }, [amountWithoutVat])

  useEffect(() => {
    dispatch(setFormField([...invoicePath, 'vatChange'])(true))
  }, [vat])

  useEffect(() => {
    dispatch(setFormField([...invoicePath, 'amountChange'])(true))
  }, [vat])

  return (
    <div>
      <div className="govuk-heading-m">{`${t('item')} ${index}`}</div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs,
              ['cac:InvoiceLine', 'cbc:ID'],
              ['cac:CreditNoteLine', 'cbc:ID'],
              formType)}
            label={t('itemId')}
            path={[...path, 'id']}
            disabled
            value={number}
          />
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Field
            docs={getDoc(docs,
              ['cac:InvoiceLine', 'cac:Item', 'cbc:Name'],
              ['cac:CreditNoteLine', 'cac:Item', 'cbc:Name'],
              formType
            )}
            label={t('itemName')}
            path={[...path, 'name']}
          />
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Field
            docs={getDoc(docs,
              ['cac:InvoiceLine', 'cac:Item', 'cbc:Description'],
              ['cac:CreditNoteLine', 'cac:Item', 'cbc:Description'],
              formType
            )}
            label={t('itemDescription')}
            path={[...path, 'description']}
            nullable
          />
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs,
              ['cac:InvoiceLine', 'cbc:InvoicedQuantity'],
              ['cac:CreditNoteLine', 'cbc:CreditedQuantity'],
              formType
            )}
            label={t('itemQuantity')}
            path={[...path, 'quantity']}
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs,
              ['cac:InvoiceLine', 'cbc:InvoicedQuantity', 'unitCode'],
              ['cac:CreditNoteLine', 'cbc:CreditedQuantity', 'unitCode'],
              formType
            )}
            label={t('quantityUnit')}
            path={[...path, 'unit']}
          />
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs,
              ['cac:InvoiceLine', 'cac:Price', 'cbc:PriceAmount'],
              ['cac:CreditNoteLine', 'cac:Price', 'cbc:PriceAmount'],
              formType
            )}
            label={t('quantityUnitPrice')}
            path={[...path, 'quantityUnitPrice']}
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs,
              ['cac:InvoiceLine', 'cbc:LineExtensionAmount'],
              ['cac:CreditNoteLine', 'cbc:LineExtensionAmount'],
              formType
            )}
            label={t('itemAmountWithoutVat')}
            path={[...path, 'amountWithoutVat']}
            disabled
            nullable
            value={(Number(itemQuantity) && Number(quantityUnitPrice) ?
              Number(itemQuantity) * Number(quantityUnitPrice)
              :
              0
            ).toFixed(2)}
          />
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs,
              ['cac:InvoiceLine', 'cac:Item', 'cac:ClassifiedTaxCategory', 'cbc:ID'],
              ['cac:CreditNoteLine', 'cac:Item', 'cac:ClassifiedTaxCategory', 'cbc:ID'],
              formType
            )}
            label={t('itemTaxCategory')}
            path={[...path, 'taxCategory']}
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs,
              ['cac:InvoiceLine', 'cac:Item', 'cac:ClassifiedTaxCategory', 'cbc:Percent'],
              ['cac:CreditNoteLine', 'cac:Item', 'cac:ClassifiedTaxCategory', 'cbc:Percent'],
              formType
            )}
            label={t('itemTaxPercentage')}
            path={[...path, 'taxPercentage']}
          />
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs,
              ['cac:TaxTotal', 'cac:TaxSubtotal', 'cac:TaxCategory', 'cbc:TaxExemptionReasonCode']
            )}
            label={t('itemTaxExemptionCode')}
            path={[...path, 'taxExemptionCode']}
            nullable
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs,
              ['cac:InvoiceLine', 'cbc:LineExtensionAmount'],
              ['cac:CreditNoteLine', 'cbc:LineExtensionAmount'],
              formType
            )}
            label={t('itemVat')}
            path={[...path, 'vat']}
            disabled
            value={(Number(taxPercentage) && Number(itemQuantity) && Number(quantityUnitPrice) ?
              Number(taxPercentage) * Number(itemQuantity) * Number(quantityUnitPrice) / 100
              :
              0
            ).toFixed(2)}
          />
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs,
              ['cac:InvoiceLine', 'cbc:LineExtensionAmount'],
              ['cac:CreditNoteLine', 'cbc:LineExtensionAmount'],
              formType
            )}
            label={t('itemQuantityUnitPriceWithVat')}
            path={[...path, 'quantityUnitPriceWithVat']}
            disabled
            value={(Number(taxPercentage) && Number(quantityUnitPrice) ?
              (1 + Number(taxPercentage) / 100) * Number(quantityUnitPrice)
              :
              0
            ).toFixed(2)}
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs,
              ['cac:InvoiceLine', 'cbc:LineExtensionAmount'],
              ['cac:CreditNoteLine', 'cbc:LineExtensionAmount'],
              formType
            )}
            label={t('itemAmount')}
            path={[...path, 'amount']}
            disabled
            value={(Number(taxPercentage) && Number(itemQuantity) && Number(quantityUnitPrice) ?
              (1 + Number(taxPercentage) / 100) * Number(itemQuantity) * Number(quantityUnitPrice)
              :
              0
            ).toFixed(2)}
          />
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Field
            docs={getDoc(docs,
              ['cac:InvoiceLine', 'cbc:AccountingCost'],
              ['cac:CreditNoteLine', 'cbc:AccountingCost'],
              formType
            )}
            label={t('itemAccountingCost')}
            path={[...path, 'accountingCost']}
            nullable
          />
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Field
            docs={getDoc(docs,
              ['cac:TaxTotal', 'cac:TaxSubtotal', 'cac:TaxCategory', 'cbc:TaxExemptionReason']
            )}
            label={t('itemTaxExemptionReason')}
            path={[...path, 'taxExemptionReason']}
            nullable
          />
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Field
            docs={getDoc(docs,
              ['cac:InvoiceLine', 'cbc:Note'],
              ['cac:CreditNoteLine', 'cbc:Note'],
              formType
            )}
            label={t('itemNote')}
            path={[...path, 'note']}
            nullable
          />
        </div>
      </div>
    </div>
  )
}

export default ({docs, formType, path}) => {
  const dispatch = useDispatch()
  const items = useSelector(formItemsSelector(formType))

  const {t} = useTranslation('form')
  const itemsCount = Object.keys(items).length

  return (
    <div>
      <div className="govuk-heading-l">{t('items')}</div>
      { Object.entries(items).map(([id, item], index) => (
        <Item
          key={id}
          formType={formType}
          docs={docs}
          path={[...path, id]}
          item={item}
          index={id}
          number={index + 1}
        />
      ))}
      <Button
        onClick={() => {dispatch(addItem(path, itemsCount + 1))}}
      >
        {t('addItem')}
      </Button>
      { itemsCount > 0 &&
      <Button
        className="ml-3 govuk-button--warning"
        onClick={() => {dispatch(removeItem(path, itemsCount))}}
      >
        {t('removeItem')}
      </Button>}
    </div>
  )
}
