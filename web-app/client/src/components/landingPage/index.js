import {useTranslation} from 'react-i18next'
import {Card} from 'react-bootstrap'

export default () => {
  const {t} = useTranslation('LandingPage')
  return (
    <div>
      <h1 style={{textAlign: 'center'}}>{t('title')}</h1>
      <div style={{margin: '10px 0'}}>
        <span>{t('introduction')}:</span>
        <ol>
          <li>
            <span style={{fontWeight: 'bold'}}>(B/G)2(B/G)</span> - {t('version1')}
          </li>
          <li>
            <span style={{fontWeight: 'bold'}}>(B/G)2(B/G) {t('forForeignReceivers')}</span> - {t('version2')}
          </li>
          <li>
            <span style={{fontWeight: 'bold'}}>(B/G)2G {t('forForeignIssuers')}</span> - {t('version3')}
          </li>
          <li>
            <span style={{fontWeight: 'bold'}}>(B/G)2B {t('forForeignIssuers')}</span> - {t('version4')}
          </li>
          <li>
            <span style={{fontWeight: 'bold'}}>(B/G)2C</span> - {t('version5')}
          </li>
        </ol>
      </div>
      <Card style={{margin: '10px 0'}}>
        <Card.Header className="bg-primary text-white text-center" as="h3">
          {t('announcements')}
        </Card.Header>
        <Card.Body>
          <strong>{t('announcement1')}</strong>
        </Card.Body>
      </Card>
    </div>
  )
}
