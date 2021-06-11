import GeneralInfo from './GeneralInfo'
import Supplier from './Supplier'
import Customer from './Customer'
import Items from './Items'
import Recapitulation from './Recapitulation'
import Notes from './Notes'
import {useTranslation} from 'react-i18next'
import {useState} from 'react'
import Button from '../../../helpers/idsk/Button'

export default ({formType, path, docs}) => {
  const {t} = useTranslation('form')
  const [section, setSection] = useState(0)

  const sectionLink = (index, name) => (
    <a
      style={{textAlign: 'center', color: '#007bff'}}
      className="govuk-heading-s govuk-grid-column-one-half"
      onClick={() => setSection(index)}
    >
      {section === index ? <u>{t(name)}</u> : t(name)}
    </a>
  )

  return (
    <div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-third govuk-grid-row">
          {sectionLink(0, 'generalInfo')}
          {sectionLink(1, 'supplier')}
        </div>
        <div className="govuk-grid-column-one-third govuk-grid-row">
          {sectionLink(2, 'customer')}
          {sectionLink(3, 'items')}
        </div>
        <div className="govuk-grid-column-one-third govuk-grid-row">
          {sectionLink(4, 'recapitulation')}
          {sectionLink(5, 'notes')}
        </div>
      </div>
      <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />
      { section === 0 && <GeneralInfo formType={formType} path={[...path, 'general']} docs={docs} />}
      { section === 1 && <Supplier path={[...path, 'supplier']} docs={docs} />}
      { section === 2 && <Customer path={[...path, 'customer']} docs={docs} />}
      { section === 3 && <Items formType={formType} path={[...path, 'items']} docs={docs} />}
      { section === 4 && <Recapitulation formType={formType} path={[...path, 'recapitulation']} docs={docs} />}
      { section === 5 && <Notes path={[...path, 'notes']} docs={docs} />}
      <div className="govuk-button-group">
        { section > 0 &&
        <Button className="govuk-button--secondary" onClick={() => setSection(section - 1)}>
          {t('previousSection')}
        </Button>}
        { section < 5 &&
        <Button onClick={() => setSection(section + 1)}>
          {t('nextSection')}
        </Button>}
      </div>
    </div>
  )
}
