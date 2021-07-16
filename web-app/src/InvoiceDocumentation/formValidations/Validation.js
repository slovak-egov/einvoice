import {useTranslation} from 'react-i18next'
import NotFound from '../../helpers/NotFound'
import {businessTermLink} from '../../helpers/businessTerms'

export default ({rule, id, businessTerms, codeLists}) => {
  const {i18n, t} = useTranslation('common')

  if (rule == null) return <NotFound />

  return (
    <>
      <h1 className="govuk-heading-l">{id}</h1>
      <div className="govuk-grid-row">
        <strong className="govuk-grid-column-one-quarter">{t('invoiceDocs.validations.message')}</strong>
        <div className="govuk-grid-column-three-quarters">{rule.message[i18n.language]}</div>
      </div>
      { rule.description && <div className="govuk-grid-row">
        <strong className="govuk-grid-column-one-quarter">{t('invoiceDocs.validations.description')}</strong>
        <div className="govuk-grid-column-three-quarters">{rule.description[i18n.language]}</div>
      </div>
      }
      <div className="govuk-grid-row">
        <strong className="govuk-grid-column-one-quarter">{t('invoiceDocs.validations.businessTerm')}</strong>
        <div className="govuk-grid-column-three-quarters">{businessTermLink(rule.businessTerm)} - {businessTerms[rule.businessTerm].name[i18n.language]}</div>
      </div>
      {rule.values && <div className="govuk-grid-row">
        <strong className="govuk-grid-column-one-quarter">{t('invoiceDocs.validations.conditionalValues')}</strong>
        <div className="govuk-grid-column-three-quarters">
          {rule.values.map((value, index) =>
            (<code key={index}>
              {value}
              {rule.codeList ? ` - ${codeLists[rule.codeList].codes[value].name[i18n.language]}` : ''}
            </code>)
          )}
        </div>
      </div>
      }
    </>
  )
}
