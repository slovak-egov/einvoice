import {useTranslation} from 'react-i18next'
import NotFound from '../../helpers/NotFound'

export default ({data, identifier}) => {
  const {i18n, t} = useTranslation('common')
  // Non-existent code list
  if (data == null) return <NotFound />
  return (
    <>
      <h1 className="govuk-heading-l">{data.title[i18n.language]}</h1>
      <div className="govuk-grid-row">
        <strong className="govuk-grid-column-one-quarter">{t('invoiceDocs.identifier')}</strong>
        <div className="govuk-grid-column-three-quarters">{identifier}</div>
      </div>
      <div className="govuk-grid-row">
        <strong className="govuk-grid-column-one-quarter">{t('invoiceDocs.agency')}</strong>
        <div className="govuk-grid-column-three-quarters">{data.agency}</div>
      </div>
      {data.version && <div className="govuk-grid-row">
        <strong className="govuk-grid-column-one-quarter">{t('invoiceDocs.version')}</strong>
        <div className="govuk-grid-column-three-quarters">{data.version}</div>
      </div>}
      <div className="govuk-grid-row">
        <strong className="govuk-grid-column-one-quarter">{t('invoiceDocs.codes')}</strong>
        <div className="govuk-grid-column-three-quarters">
          {Object.entries(data.codes).map(([code, {name, description}], index) => (
            <div key={index} className="mt-2 d-flex flex-column">
              <code>{code}</code>
              <strong>{name[i18n.language]}</strong>
              {description && <p>{description[i18n.language]}</p>}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
