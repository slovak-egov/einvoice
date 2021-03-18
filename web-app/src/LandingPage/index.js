import {useTranslation} from 'react-i18next'
import {exampleInvoiceUrl, invoiceFormats, swaggerUrl} from '../utils/constants'

const Announcement = ({children, title}) => (
  <>
    <h3 className="govuk-heading-m">{title}</h3>
    <div>{children}</div>
    <hr className="idsk-crossroad-line" />
  </>
)

export default () => {
  const {t} = useTranslation('LandingPage')
  return (
    <>
      <h1 className="govuk-heading-xl">{t('title')}</h1>
      {window.location.hostname.startsWith('dev') && <h2 className="text-danger">{t('devVersion')}</h2>}
      {window.location.hostname.startsWith('fix') && <h2 className="text-danger">{t('fixVersion')}</h2>}
      <div>
        <span>{t('introduction')}:</span>
        <ol>
          <li>
            <strong>(B/G)2(B/G)</strong> - {t('version1')}
          </li>
          <li>
            <strong>(B/G)2(B/G) {t('forForeignReceivers')}</strong> - {t('version2')}
          </li>
          <li>
            <strong>(B/G)2G {t('forForeignIssuers')}</strong> - {t('version3')}
          </li>
          <li>
            <strong>(B/G)2B {t('forForeignIssuers')}</strong> - {t('version4')}
          </li>
          <li>
            <strong>(B/G)2C</strong> - {t('version5')}
          </li>
        </ol>
      </div>
      <div>
        <h2 className="govuk-heading-l">{t('announcements.title')}</h2>
        <Announcement title={t('announcements.4.title')}>
          {t('announcements.4.body.0')}&nbsp;
          <a
            href="https://www.profesia.sk/praca/ministerstvo-financii-sr/O4041786"
            target="_blank"
          >
            {t('announcements.4.body.1')}
          </a>.
        </Announcement>
        <Announcement title={t('announcements.1.title')}>
          {t('announcements.1.body')}
        </Announcement>
        <Announcement title={t('announcements.2.title')}>
          <div>{t('announcements.2.body.0')}:</div>
          <ul>
            <li>{t('announcements.2.user')}: <strong>E0000046137</strong></li>
            <li>{t('announcements.2.password')}: <strong>PopradTa3@</strong></li>
          </ul>
          <div>{t('announcements.2.body.1')}:</div>
          <ul>
            <li>{t('announcements.2.user')}: <strong>E0000046141</strong></li>
            <li>{t('announcements.2.password')}: <strong>PopradTa3@</strong></li>
          </ul>
          <div>{t('announcements.2.body.2')}:</div>
          <ul>
            <li>
              <a href={exampleInvoiceUrl(invoiceFormats.D16B, 'invoice')} target="_blank">
                {t('announcements.2.links.0')}
              </a>
            </li>
            <li>
              <a href={exampleInvoiceUrl(invoiceFormats.D16B, 'invoice-rules-violation')} target="_blank">
                {t('announcements.2.links.1')}
              </a>
            </li>
            <li>
              <a href={exampleInvoiceUrl(invoiceFormats.UBL, 'invoice')} target="_blank">
                {t('announcements.2.links.2')}
              </a>
            </li>
            <li>
              <a href={exampleInvoiceUrl(invoiceFormats.UBL, 'invoice-rules-violation')} target="_blank">
                {t('announcements.2.links.3')}
              </a>
            </li>
            <li>
              <a href={exampleInvoiceUrl(invoiceFormats.UBL, 'invoice-xsd-violation')} target="_blank">
                {t('announcements.2.links.4')}
              </a>
            </li>
            <li>
              <a href={exampleInvoiceUrl(invoiceFormats.UBL, 'creditNote')} target="_blank">
                {t('announcements.2.links.5')}
              </a>
            </li>
          </ul>
          <div>
            {t('announcements.2.body.3')}&nbsp;
            <a href="https://edesk.vyvoj.upvs.globaltel.sk" target="_blank">{t('announcements.2.body.4')}</a>
          </div>
        </Announcement>
        <Announcement title="API">
          {t('announcements.3.body.0')}&nbsp;
          <a href={swaggerUrl} target="_blank">{t('announcements.3.body.1')}</a>.
        </Announcement>
      </div>
    </>
  )
}
