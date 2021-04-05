import {useTranslation} from 'react-i18next'
import Link from './Link'

export default ({logo, navigation}) => {
  const {t} = useTranslation('common')
  return (
    <div style={{marginTop: 'auto'}}>
      <footer data-module="idsk-footer-extended" className="idsk-footer-extended" role="contentinfo">
        <div className="idsk-footer-extended-main-content">
          <div className="govuk-width-container">
            <div className="govuk-grid-column-full">
              <div className="idsk-footer-extended-description-panel">
                <div className="idsk-footer-extended-meta-item">
                  <ul className="idsk-footer-extended-inline-list">
                    {navigation.map(({title, ...attributes}, index) => (
                      <li key={index} className="idsk-footer-extended-inline-list-item">
                        <Link className="govuk-link" {...attributes}>
                          {title}
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
                  <a href={logo.href} target="_blank" rel="noreferrer noopener">
                    <h2 className="idsk-footer-extended-logo">
                      <img src={logo.src} />
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
