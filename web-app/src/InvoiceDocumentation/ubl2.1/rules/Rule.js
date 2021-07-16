import {useSelector} from 'react-redux'
import {Link} from 'react-router-dom'
import {Fragment} from 'react'
import {useTranslation} from 'react-i18next'
import NotFound from '../../../helpers/NotFound'
import {ubl21RuleSelector} from '../../../cache/documentation/state'
import {addBusinessTermsLinks} from '../../../helpers/businessTerms'

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
      {rule.invoiceTags && <div className="govuk-grid-row">
        <strong className="govuk-grid-column-one-quarter">{t('invoiceDocs.ublInvoice')}</strong>
        <div className="govuk-grid-column-three-quarters">
          {rule.invoiceTags.map((path, i) => (
            <Fragment key={i}>
              {i !== 0 && <br />}
              {path.map((tag, j) => (
                <Fragment key={j}>
                  <span> / </span>
                  <Link to={`/invoiceDocumentation/ublInvoice/${path.slice(0, j + 1).join('/')}`}>{tag}</Link>
                </Fragment>
              ))}
            </Fragment>
          ))}
        </div>
      </div>}
      {rule.creditNoteTags && <div className="govuk-grid-row">
        <strong className="govuk-grid-column-one-quarter">{t('invoiceDocs.ublCreditNote')}</strong>
        <div className="govuk-grid-column-three-quarters">
          {rule.creditNoteTags.map((path, i) => (
            <Fragment key={i}>
              {i !== 0 && <br />}
              {path.map((tag, j) => (
                <Fragment key={j}>
                  <span> / </span>
                  <Link to={`/invoiceDocumentation/ublCreditNote/${path.slice(0, j + 1).join('/')}`}>{tag}</Link>
                </Fragment>
              ))}
            </Fragment>
          ))}
        </div>
      </div>}
    </>
  )
}
