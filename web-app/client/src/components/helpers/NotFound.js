import React from 'react'
import {useTranslation} from 'react-i18next'

export default () => {
  const {t} = useTranslation('helpers')
  return (
    <div>
      <h1>404</h1>
      <h2>{t('notfound.title')}</h2>
      <div>{t('notfound.description')}</div>
    </div>
  )
}
