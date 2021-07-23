import {useTranslation} from 'react-i18next'

export default ({logos}) => {
  const {t} = useTranslation('common')
  return (
    <div style={{marginTop: 'auto'}}>
      <footer data-module="idsk-footer-extended" className="idsk-footer-extended" role="contentinfo">
        <div className="idsk-footer-extended-main-content govuk-main-wrapper container">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-third">
              {logos.map((logo, index) => (
                <a key={index} href={logo.href} target="_blank" rel="noreferrer noopener">
                  <h2 className="idsk-footer-extended-logo">
                    <img src={logo.src} style={{maxWidth: '100%'}} />
                  </h2>
                </a>
              ))}
            </div>
            <div className="govuk-grid-column-two-thirds">
              <div className="idsk-footer-extended-description-panel">
                <p className="idsk-footer-extended-frame">
                  {t('footer.description.0')}
                </p>
                <p className="idsk-footer-extended-frame">
                  {t('footer.description.1')}&nbsp;
                  <a className="idsk-footer__link" href="https://idsk.gov.sk" target="_blank">
                    {t('footer.description.2')}
                  </a>
                </p>
              </div>
              <div className="idsk-footer-extended-description-panel">
                <div className="idsk-footer-extended-meta-item">
                  <div className="idsk-footer-extended-inline-list govuk-grid-row">
                    <div className="govuk-grid-column-one-quarter">
                      <a href="/invoiceDocumentation">{t('footer.documentation')}</a>
                    </div>
                    <div className="govuk-grid-column-one-quarter">
                      <a href="/">{t('footer.manual')}</a>
                    </div>
                    <div className="govuk-grid-column-one-quarter">
                      <a href="/">{t('footer.invoiceExamples')}</a>
                    </div>
                    <div className="govuk-grid-column-one-quarter">
                      <a href="/">{t('footer.legislation')}</a>
                    </div>
                  </div>
                  <div className="idsk-footer-extended-inline-list govuk-grid-row">
                    <div className="govuk-grid-column-one-quarter">
                      <a href="/">{t('footer.gdpr')}</a>
                    </div>
                    <div className="govuk-grid-column-one-quarter">
                      <a href="/">Cookies</a>
                    </div>
                    <div className="govuk-grid-column-one-quarter">
                      <a href="mailto: e-fakturacia@mfsr.sk">{t('footer.help')}</a>
                    </div>
                    <div className="govuk-grid-column-one-quarter">
                      <a href="/faq">FAQ</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
