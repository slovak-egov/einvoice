import {useDispatch, useSelector} from 'react-redux'
import {useTranslation} from 'react-i18next'
import {useEffect} from 'react'
import {formFieldSelector, formItemsSelector} from '../state'
import {setFormField} from '../actions'
import {Table} from '../../../helpers/idsk'
import {Link} from 'react-router-dom'

const businessTerm = (id) => <Link to={`/invoiceDocumentation/businessTerms/${id}`}>{id}</Link>

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
        rows={[
          [
            {children: ''},
            {children: <div><b>{t('taxPercentage')}</b> ({businessTerm('BT-119')})</div>},
            {children: <div><b>{t('taxBase')}</b> ({businessTerm('BT-116')})</div>},
            {children: <div><b>{t('vat')}</b> ({businessTerm('BT-117')})</div>},
            {children: <div><b>{t('total')}</b> ({businessTerm('BT-112')})</div>},
          ], ...Object.entries(items).map(([itemIndex, item], index) => [
            {children: `${t('item')} ${index + 1}`},
            {children: item.taxPercentage},
            {children: item.amountWithoutVat},
            {children: item.vat},
            {children: item.amount},
          ]), [
            {children: ''},
            {children: <div className="govuk-heading-s">{t('total')}:</div>},
            {children: <div>{amountWithoutVat} ({businessTerm('BT-109')})</div>},
            {children: <div>{vat} ({businessTerm('BT-110')})</div>},
            {children: <div>{amount} ({businessTerm('BT-112')})</div>},
          ], [
            {children: ''},
            {children: ''},
            {children: ''},
            {children: <div><b>{t('totalToPay')}</b> ({businessTerm('BT-115')})</div>},
            {children: amount},
          ]]}
      />
    </div>
  )
}
