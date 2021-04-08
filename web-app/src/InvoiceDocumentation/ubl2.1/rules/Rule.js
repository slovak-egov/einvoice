import {useSelector} from 'react-redux'
import {Link} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import NotFound from '../../../helpers/NotFound'
import {ubl21RuleSelector} from '../../../cache/documentation/state'

const addBusinessTermsLinks = (msg, businessTerms) => {
  const reg = new RegExp(`(${businessTerms.join('|')})`, 'g')
  const parts = msg.split(reg)
  for (let i = 1; i < parts.length; i += 2) {
    parts[i] = <Link key={i} to={`/invoiceDocumentation/businessTerms/${parts[i]}`}>{parts[i]}</Link>
  }
  return parts
}

export default ({match}) => {
  const {i18n, t} = useTranslation('common')

  const ruleId = match.params.id
  const rule = useSelector(ubl21RuleSelector(ruleId))

  // Rule does not exist in invoice rules documentation
  if (rule == null) return <NotFound />

  return (
    <>
      <h1 className="govuk-heading-l">{ruleId}</h1>
      <div className="govuk-grid-row">
        <strong className="govuk-grid-column-one-quarter">{t('invoiceDocs.rules.message')}</strong>
        <div className="govuk-grid-column-three-quarters">{addBusinessTermsLinks(rule.message[i18n.language], rule.businessTerms)}</div>
      </div>
      <div className="govuk-grid-row">
        <strong className="govuk-grid-column-one-quarter">{t('invoiceDocs.rules.context')}</strong>
        <div className="govuk-grid-column-three-quarters"><code>{rule.context}</code></div>
      </div>
      <div className="govuk-grid-row">
        <strong className="govuk-grid-column-one-quarter">{t('invoiceDocs.rules.test')}</strong>
        <div className="govuk-grid-column-three-quarters"><code>{rule.test}</code></div>
      </div>
      <div className="govuk-grid-row">
        <strong className="govuk-grid-column-one-quarter">{t('invoiceDocs.rules.flag')}</strong>
        <div className="govuk-grid-column-three-quarters">{t(`invoiceDocs.rules.flags.${rule.flag}`)}</div>
      </div>
    </>
  )
}
