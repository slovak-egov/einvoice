import {useTranslation} from 'react-i18next'
import {Card} from 'react-bootstrap'
import {exampleInvoiceUrl, invoiceFormats} from '../utils/constants'

const Announcement = ({className, children, title}) => (
  <Card className={className}>
    <Card.Header className="bg-info text-white" as="h4">{title}</Card.Header>
    <Card.Body>{children}</Card.Body>
  </Card>
)

export default () => {
  const {t} = useTranslation('LandingPage')
  return (
    <div>
      <h1 style={{textAlign: 'center'}}>{t('title')}</h1>
      {window.location.hostname.startsWith('dev') && <h2 className="text-danger">{t('devVersion')}</h2>}
      {window.location.hostname.startsWith('fix') && <h2 className="text-danger">{t('fixVersion')}</h2>}
      <div style={{margin: '10px 0'}}>
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
      <Card className="mb-1">
        <Card.Header className="bg-primary text-white text-center" as="h3">
          {t('announcements.title')}
        </Card.Header>
        <Card.Body>
          <Announcement className="mb-1" title={t('announcements.1.title')}>
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
              {t('announcements.2.body.2')}&nbsp;
              <a href="https://edesk.vyvoj.upvs.globaltel.sk" target="_blank">{t('announcements.2.body.3')}</a>
            </div>
          </Announcement>
        </Card.Body>
      </Card>
    </div>
  )
}
