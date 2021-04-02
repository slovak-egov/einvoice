import {useTranslation} from 'react-i18next'

export default () => {
  const {t} = useTranslation('common')
  return (
    <main className="govuk-main-wrapper govuk-main-wrapper--l" id="main-content" role="main">
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-l">{t('unauthorized.title')}</h1>
          <p className="govuk-body">
            {t('unauthorized.description')}
          </p>
        </div>
      </div>
    </main>
  )
}
