import {useTranslation} from 'react-i18next'
import Link from './Link'
import skLogo from './mfsr-logo-sk.png'
import enLogo from './mfsr-logo-en.png'

export default ({navigation}) => {
  const {i18n, t} = useTranslation('common')
  return (
    <div data-module="idsk-footer-extended" style={{marginTop: 'auto'}}>
      <footer className="idsk-footer-extended " role="contentinfo">
        <div className="idsk-footer-extended-main-content">
          <div className="govuk-width-container">
            <div className="govuk-grid-column-full">
              <div className="idsk-footer-extended-description-panel">
                <div className="idsk-footer-extended-meta-item">
                  <ul className="idsk-footer-extended-inline-list ">
                    {navigation.map(({title, ...attributes}, index) => (
                      <li key={index} className="idsk-footer-extended-inline-list-item">
                        <Link className="govuk-link" {...attributes}>
                          {t(title)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="govuk-grid-column-two-thirds idsk-footer-extended-info-links">
                  <p className="idsk-footer-extended-frame">
                    {t('footer.0')}&nbsp;
                    <a className="idsk-footer__link" href="https://idsk.gov.sk" target="_blank">
                      {t('footer.1')}
                    </a>
                  </p>
                  <p className="idsk-footer-extended-frame">
                    {t('footer.2')}
                  </p>
                </div>
                <div className="govuk-grid-column-one-third idsk-footer-extended-logo-box">
                  <a href="https://mfsr.sk" target="_blank">
                    <h2 className="idsk-footer-extended-logo">
                      <img src={i18n.language === 'sk' ? skLogo : enLogo} />
                    </h2>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
