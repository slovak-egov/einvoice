import {useTranslation} from 'react-i18next'
import {useDispatch, useSelector} from 'react-redux'
import {useEffect} from 'react'
import {countErrors, getDoc} from './helpers'
import {formFieldSelector, formItemsSelector} from '../state'
import {addItem, removeItem, setFormField} from '../actions'
import {Field} from '../Field'
import {Accordion, Button} from '../../../helpers/idsk'
import {invoiceComplexities} from '../../../utils/constants'
import {codeListsSelector} from '../../../cache/documentation/state'

const Item = ({docs, formType, path, index, number, errorCounter}) => {
  const invoicePath = [formType, invoiceComplexities.SIMPLE]
  const {t, i18n} = useTranslation('form')
  const dispatch = useDispatch()
  const codeLists = useSelector(codeListsSelector)
  const itemQuantity = useSelector(formFieldSelector([...path, 'quantity']))
  const netPrice = useSelector(formFieldSelector([...path, 'netPrice']))
  const taxPercentage = useSelector(formFieldSelector([...path, 'taxPercentage']))
  const amountWithoutVat = useSelector(formFieldSelector([...path, 'amountWithoutVat']))
  const amount = useSelector(formFieldSelector([...path, 'amount']))
  const vat = useSelector(formFieldSelector([...path, 'vat']))
  const taxCategory = useSelector(formFieldSelector([...path, 'taxCategory']))
  const taxExemptionCode = useSelector(formFieldSelector([...path, 'taxExemptionCode']))
  const taxExemptionReason = useSelector(formFieldSelector([...path, 'taxExemptionReason']))
  const recapitulationChange = useSelector(formFieldSelector([...path, 'recapitulationChange']))

  useEffect(() => {
    const newVat = Number(taxPercentage) >= 0 && Number(itemQuantity) && Number(netPrice) ?
      (Number(taxPercentage) * Number(itemQuantity) * Number(netPrice) / 100).toFixed(2)
      : undefined

    const newAmount = Number(taxPercentage) >= 0 && Number(itemQuantity) && Number(netPrice) ?
      ((1 + Number(taxPercentage) / 100) * Number(itemQuantity) * Number(netPrice)).toFixed(2)
      : undefined

    if (newVat !== vat) dispatch(setFormField([...path, 'vat'])(newVat))
    if (newAmount !== amount) dispatch(setFormField([...path, 'amount'])(newAmount))
  }, [taxPercentage, itemQuantity, netPrice])

  useEffect(() => {
    const newTaxExemptionReason = taxExemptionCode && codeLists.vatex.codes[taxExemptionCode] &&
      codeLists.vatex.codes[taxExemptionCode].name[i18n.language]

    if (newTaxExemptionReason !== taxExemptionReason) {
      dispatch(setFormField([...path, 'taxExemptionReason'])(newTaxExemptionReason))
    }
  }, [taxExemptionCode])

  useEffect(() => {
    if (!recapitulationChange) dispatch(setFormField([...invoicePath, 'recapitulationChange'])(true))
  }, [amountWithoutVat, amount, vat, taxPercentage,
    taxCategory, taxExemptionCode])

  return (
    <div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs,
              ['cac:InvoiceLine', 'cbc:ID'],
              ['cac:CreditNoteLine', 'cbc:ID'],
              formType)}
            label={t('itemId')}
            path={[...path, 'id']}
            notEditable
            value={number}
            id={`item-${index}-id`}
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
            id={`item-${index}-name`}
            errorCounter={errorCounter}
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
            id={`item-${index}-description`}
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
            id={`item-${index}-quantity`}
            errorCounter={errorCounter}
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
            id={`item-${index}-quantity-unit`}
            errorCounter={errorCounter}
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
            label={t('itemNetPrice')}
            path={[...path, 'netPrice']}
            id={`item-${index}-net-price`}
            errorCounter={errorCounter}
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
            notEditable
            nullable
            value={(Number(itemQuantity) && Number(netPrice) ?
              Number(itemQuantity) * Number(netPrice)
              :
              0
            ).toFixed(2)}
            id={`item-${index}-amount-without-vat`}
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
            id={`item-${index}-tax-category`}
            errorCounter={errorCounter}
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
            value={taxPercentage}
            id={`item-${index}-tax-percentage`}
            errorCounter={errorCounter}
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
            id={`item-${index}-tax-exemption-code`}
            nullable
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs,
              ['cac:InvoiceLine', 'cbc:AccountingCost'],
              ['cac:CreditNoteLine', 'cbc:AccountingCost'],
              formType
            )}
            label={t('itemAccountingCost')}
            path={[...path, 'accountingCost']}
            id={`item-${index}-accounting-cost`}
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
            id={`item-${index}-note`}
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
  const errorCounter = countErrors(path, dispatch)
  const {t, i18n} = useTranslation('form')
  const itemsCount = Object.keys(items).length

  return (
    <div>
      <div className="govuk-heading-l">{t('items')}</div>
      <Accordion
        key={i18n.language + itemsCount}
        items={Object.entries(items).map(([id, item], index) => ({
          heading: {children: t('item', {index: index + 1})},
          expanded: true,
          content: {children: (
            <Item
              formType={formType}
              docs={docs}
              path={[...path, 'list', id]}
              item={item}
              index={id}
              number={index + 1}
              errorCounter={errorCounter}
            />),
          },
        }))}
        id="items-list"
      />
      <Button
        onClick={() => {dispatch(addItem(path, itemsCount + 1))}}
        id="add-item"
      >
        {t('addItem')}
      </Button>
      { itemsCount > 1 &&
      <Button
        className="ml-3 govuk-button--warning"
        onClick={() => {dispatch(removeItem(path, itemsCount))}}
        id="remove-item"
      >
        {t('removeItem')}
      </Button>}
    </div>
  )
}
