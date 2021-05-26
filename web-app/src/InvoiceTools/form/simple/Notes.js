import {useTranslation} from 'react-i18next'
import {getDoc} from './docs'
import {Field} from '../Field'

export default ({docs, path}) => {
  const {t} = useTranslation('form')

  return (
    <div>
      <div className="govuk-heading-l">{t('note')}</div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Field
            docs={getDoc(docs, ['cbc:Note'])}
            label={t('note')}
            path={[...path, 'note']}
            nullable
          />
        </div>
      </div>
    </div>
  )
}
