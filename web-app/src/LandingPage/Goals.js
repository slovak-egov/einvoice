import {useTranslation} from 'react-i18next'
import HeaderBanner from '../helpers/HeaderBanner'

export default () => {
  const {t} = useTranslation('LandingPage')

  return (
    <>
      <HeaderBanner withMenu />
      <div className="govuk-main-wrapper container">
        <div className="govuk-heading-l">{t('goals.title')}</div>
        <p>{t('goals.body.0')}</p>
        <p>{t('goals.body.1')}</p>
        <p>{t('goals.body.2')}</p>
        <p>{t('goals.body.3')}</p>
        <p>{t('goals.body.4')}</p>
        <p>{t('goals.body.5')}</p>
        <p>
          {t('goals.body.6.0')}
          <a href="https://eur-lex.europa.eu/legal-content/SK/TXT/?uri=CELEX%3A32014L0055">{t('goals.body.6.1')}</a>
          {t('goals.body.6.2')}
        </p>
        <p>{t('goals.body.7')}</p>
        <p>{t('goals.body.8')}</p>
        <p><a href="http://dataset1.unms.sk/efakturacia/STN_EN_16931-1+A1">{t('goals.body.9')}</a></p>
        <p><a href="https://dataset1.unms.sk/efakturacia/STN_EN_16931-1+A1_AC">{t('goals.body.10')}</a></p>
        <p><a href="http://dataset1.unms.sk/efakturacia/STN_P_CEN_TS_16931-2">{t('goals.body.11')}</a></p>
        <p>
          {t('goals.body.12.0')}
          <a href="https://normy.unms.sk/default.aspx?page=ee3244f2-941f-43cf-91bd-a95f7eace349">{t('goals.body.12.1')}</a>
          {t('goals.body.12.2')}
        </p>
        <p>
          {t('goals.body.13.0')}
          <a href="https://www.slov-lex.sk/pravne-predpisy/SK/ZZ/2019/215/20190801">{t('goals.body.13.1')}</a>
          {t('goals.body.13.2')}
        </p>
        <p>
          {t('goals.body.14.0')}
          <a href="https://www.slov-lex.sk/legislativne-procesy/SK/PI/2021/6">{t('goals.body.14.1')}</a>
          {t('goals.body.14.2')}
        </p>
      </div>
    </>
  )
}
