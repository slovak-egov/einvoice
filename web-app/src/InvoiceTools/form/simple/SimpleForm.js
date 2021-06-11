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

export default ({formType, path, docs}) => {
  const {t} = useTranslation('form')
  const location = useLocation()
  const history = useHistory()
  const section = location.pathname.split('/').pop()
  const sections = ['general', 'supplier', 'customer', 'items', 'recapitulation', 'notes']
  const sectionIndex = sections.findIndex((s) => s === section)

  const sectionLink = (name) => (
    <Link
      style={{textAlign: 'center', color: '#007bff'}}
      className="govuk-heading-s govuk-grid-column-one-half"
      to={`/invoice-tools/form/${name}`}
    >
      {section === name ? <u>{t(name)}</u> : t(name)}
    </Link>
  )

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
          render={(props) => <Recapitulation {...props} formType={formType} path={[...path, 'recapitulation']} docs={docs} />}
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
        >
          {t('previousSection')}
        </Button>}
        { sectionIndex < sections.length - 1 &&
        <Button
          onClick={() => history.push(`/invoice-tools/form/${sections[sectionIndex + 1]}`)}
        >
          {t('nextSection')}
        </Button>}
      </div>
    </div>
  )
}
