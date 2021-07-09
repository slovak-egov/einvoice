import {useTranslation} from 'react-i18next'
import HeaderBanner from '../helpers/HeaderBanner'

export default () => {
  const {t} = useTranslation('LandingPage')

  return (
    <>
      <HeaderBanner withMenu />
      <div className="govuk-main-wrapper container">
        <div className="govuk-heading-l">{t('phases.title')}</div>
        {[...Array(8).keys()].map((index) => (
          <p key={index} style={{whiteSpace: 'pre-line'}}>{t(`phases.body.${index}`)}</p>
        ))}
      </div>
    </>
  )
}
