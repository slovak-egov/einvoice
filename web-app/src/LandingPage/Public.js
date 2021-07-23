import {useTranslation} from 'react-i18next'
import HeaderBanner from '../helpers/HeaderBanner'

export default () => {
  const {t} = useTranslation('LandingPage')

  return (
    <>
      <HeaderBanner withMenu />
      <div className="govuk-main-wrapper container">
        <div className="govuk-heading-l">{t('public.title')}</div>
        <p>{t('public.body.0')}</p>
        <p>{t('public.body.1')}</p>
        <p>{t('public.body.2')}</p>
        <p>
          {t('public.body.3.0')}
          <a href="mailto: e-fakturacia@mfsr.sk">{t('public.body.3.1')}</a>
          {t('public.body.3.2')}
        </p>
      </div>
    </>
  )
}
