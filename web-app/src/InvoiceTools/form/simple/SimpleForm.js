import GeneralInfo from './GeneralInfo'
import Supplier from './Supplier'
import Customer from './Customer'
import Items from './Items'
import Recapitulation from './Recapitulation'
import Notes from './Notes'
import {useTranslation} from 'react-i18next'
import Button from '../../../helpers/idsk/Button'
import {Redirect, Route, Switch, useHistory, useLocation} from 'react-router-dom'
import Link from '../../../helpers/idsk/Link'
import {useEffect} from 'react'
import {setFormField} from '../actions'
import {useDispatch, useSelector} from 'react-redux'
import {formFieldSelector, formItemsSelector} from '../state'

export default ({formType, path, docs}) => {
  const {t} = useTranslation('form')
  const location = useLocation()
  const dispatch = useDispatch()
  const history = useHistory()
  const section = location.pathname.split('/').pop()
  const sections = ['general', 'supplier', 'customer', 'items', 'recapitulation', 'notes']
  const sectionIndex = sections.findIndex((s) => s === section)
  const recapitulationChange = useSelector(formFieldSelector([...path, 'recapitulationChange']))
  const items = useSelector(formItemsSelector(formType))

  const recapitulationPath = [...path, 'recapitulation']

  const sectionLink = (name) => (
    <Link
      style={{textAlign: 'center', color: '#007bff'}}
      className="govuk-heading-s govuk-grid-column-one-half"
      to={`/invoice-tools/form/${name}`}
      id={`form-${name}`}
    >
      {section === name ? <u>{t(name)}</u> : t(name)}
    </Link>
  )

  useEffect(() => {
    if (!recapitulationChange) return

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

    dispatch(setFormField([...recapitulationPath, 'amountWithoutVat'])(newAmountWithoutVat.toFixed(2)))
    dispatch(setFormField([...recapitulationPath, 'vat'])(newVat.toFixed(2)))
    dispatch(setFormField([...recapitulationPath, 'amount'])(newAmount.toFixed(2)))

    dispatch(setFormField([...recapitulationPath, 'taxSubtotals'])(res))
    dispatch(setFormField([...path, 'recapitulationChange'])(false))
  }, [recapitulationChange])

  return (
    <div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-third govuk-grid-row">
          {sectionLink('general')}
          {sectionLink('supplier')}
        </div>
        <div className="govuk-grid-column-one-third govuk-grid-row">
          {sectionLink('customer')}
          {sectionLink('items')}
        </div>
        <div className="govuk-grid-column-one-third govuk-grid-row">
          {sectionLink('recapitulation')}
          {sectionLink('notes')}
        </div>
      </div>
      <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />
      <Switch>
        <Route
          exact
          path="/invoice-tools/form/general"
          render={(props) => <GeneralInfo {...props} formType={formType} path={[...path, 'general']} docs={docs} />}
        />
        <Route
          path="/invoice-tools/form/supplier"
          render={(props) => <Supplier {...props} path={[...path, 'supplier']} docs={docs} />}
        />
        <Route
          path="/invoice-tools/form/customer"
          render={(props) => <Customer {...props} path={[...path, 'customer']} docs={docs} />}
        />
        <Route
          path="/invoice-tools/form/items"
          render={(props) => <Items {...props} formType={formType} path={[...path, 'items']} docs={docs} />}
        />
        <Route
          path="/invoice-tools/form/recapitulation"
          render={(props) => (<Recapitulation
            {...props}
            formType={formType}
            path={recapitulationPath}
            docs={docs}
          />)}
        />
        <Route
          path="/invoice-tools/form/notes"
          render={(props) => <Notes {...props} path={[...path, 'notes']} docs={docs} />}
        />
        <Route path="/invoice-tools/form">
          <Redirect to="/invoice-tools/form/general" />
        </Route>
      </Switch>
      <div className="govuk-button-group">
        { sectionIndex > 0 &&
        <Button
          className="govuk-button--secondary"
          onClick={() => history.push(`/invoice-tools/form/${sections[sectionIndex - 1]}`)}
          id="previous-section"
        >
          {t('previousSection')}
        </Button>}
        { sectionIndex < sections.length - 1 &&
        <Button
          onClick={() => history.push(`/invoice-tools/form/${sections[sectionIndex + 1]}`)}
          id="next-section"
        >
          {t('nextSection')}
        </Button>}
      </div>
    </div>
  )
}
