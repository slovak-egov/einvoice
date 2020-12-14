import {useTranslation} from 'react-i18next'

export default () => {
  const {t} = useTranslation('helpers')
  return (
    <div>
      <h1>401</h1>
      <h2>{t('auth.title')}</h2>
      <div>{t('auth.description')}</div>
    </div>
  )
}
