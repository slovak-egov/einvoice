import {useTranslation} from 'react-i18next'
import HeaderBanner from '../helpers/HeaderBanner'

export default () => {
  const {t} = useTranslation('LandingPage')

  return (
    <>
      <HeaderBanner withMenu />
      <div className="govuk-main-wrapper container">
        <div className="govuk-heading-l">{t('public.title')}</div>
        {[...Array(4).keys()].map((index) => (
          <p key={index} style={{whiteSpace: 'pre-line'}}>{t(`public.body.${index}`)}</p>
        ))}
      </div>
    </>
  )
}
