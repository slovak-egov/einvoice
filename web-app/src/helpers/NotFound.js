import {useTranslation} from 'react-i18next'

export default () => {
  const {t} = useTranslation('common')
  return (
    <main className="govuk-main-wrapper container govuk-main-wrapper--l" id="main-content" role="main">
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-l">{t('notFound.title')}</h1>
          <p className="govuk-body">
            {t('notFound.description.0')}
          </p>
          <p className="govuk-body">
            {t('notFound.description.1')}
          </p>
          <p className="govuk-body">
            {t('notFound.description.2')}&nbsp;
            <a href="mailto:troubleshooting@einvoice.mfsr.sk">troubleshooting@einvoice.mfsr.sk</a>
          </p>
        </div>
      </div>
    </main>
  )
}
