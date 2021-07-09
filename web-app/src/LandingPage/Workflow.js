import {useTranslation} from 'react-i18next'
import HeaderBanner from '../helpers/HeaderBanner'
import image from './workflow.png'

export default () => {
  const {t} = useTranslation('LandingPage')

  return (
    <>
      <HeaderBanner withMenu />
      <div className="govuk-main-wrapper container">
        <div className="govuk-heading-l">{t('workflow.title')}</div>
        <img src={image} />
      </div>
    </>
  )
}
