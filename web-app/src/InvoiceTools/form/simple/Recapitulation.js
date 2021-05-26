import {useDispatch, useSelector} from 'react-redux'
import {useTranslation} from 'react-i18next'
import {useEffect} from 'react'
import {formFieldSelector, formItemsSelector} from '../state'
import {setFormField} from '../actions'
import {Table} from '../../../helpers/idsk'

export default ({path, formType}) => {
  const dispatch = useDispatch()
  const items = useSelector(formItemsSelector(formType))
  const amountWithoutVat = useSelector(formFieldSelector([...path, 'amountWithoutVat']))
  const amountWithoutVatChange = useSelector(formFieldSelector([...path, 'amountWithoutVatChange']))
  const vat = useSelector(formFieldSelector([...path, 'vat']))
  const vatChange = useSelector(formFieldSelector([...path, 'vatChange']))
  const amount = useSelector(formFieldSelector([...path, 'amount']))
  const amountChange = useSelector(formFieldSelector([...path, 'amountChange']))
  const {t} = useTranslation('form')

  useEffect(() => {
    if (!amountWithoutVatChange) return

    let newAmountWithoutVat = 0
    Object.values(items).forEach((item) => {
      if (Number(item.amountWithoutVat)) newAmountWithoutVat += Number(item.amountWithoutVat)
    })

    if (amountWithoutVat !== newAmountWithoutVat) {
      dispatch(setFormField([...path, 'amountWithoutVat'])(newAmountWithoutVat.toFixed(2)))
    }
    dispatch(setFormField([...path, 'amountWithoutVatChange'])(false))
  }, [amountWithoutVatChange])

  useEffect(() => {
    if (!vatChange) return

    let newVat = 0
    Object.values(items).forEach((item) => {
      if (Number(item.vat)) newVat += Number(item.vat)
    })

    if (vat !== newVat) {
      dispatch(setFormField([...path, 'vat'])(newVat.toFixed(2)))
    }
    dispatch(setFormField([...path, 'vatChange'])(false))
  }, [vatChange])

  useEffect(() => {
    if (!amountChange) return
    let newAmount = 0
    Object.values(items).forEach((item) => {
      if (Number(item.amount)) newAmount += Number(item.amount)
    })

    if (amount !== newAmount) {
      dispatch(setFormField([...path, 'amount'])(newAmount.toFixed(2)))
    }
    dispatch(setFormField([...path, 'amountChange'])(false))
  }, [amountChange])

  return (
    <div>
      <div className="govuk-heading-l">{t('recapitulation')}</div>
      <Table
        head={[
          {children: ''},
          {children: t('taxPercentage')},
          {children: t('taxBase')},
          {children: t('vat')},
          {children: t('total')},
        ]}
        rows={[...Object.entries(items).map(([itemIndex, item], index) => [
          {children: `${t('item')} ${index + 1}`},
          {children: item.taxPercentage},
          {children: item.amountWithoutVat},
          {children: item.vat},
          {children: item.amount},
        ]), [
          {children: ''},
          {children: <div className="govuk-heading-s">{t('total')}:</div>},
          {children: amountWithoutVat},
          {children: vat},
          {children: amount},
        ], [
          {children: ''},
          {children: ''},
          {children: ''},
          {children: <div className="govuk-heading-m">{t('totalToPay')}</div>},
          {children: amount},
        ]]}
      />
    </div>
  )
}
