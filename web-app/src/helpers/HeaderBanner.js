import {useTranslation} from 'react-i18next'
import {Link} from './idsk'

export default ({withMenu}) => {
  const {t} = useTranslation('LandingPage')

  return (
    <div className="app-pane-blue">
      <div className="container">
        <div className="govuk-grid-row" style={{minHeight: '10vw'}}>
          <div className="govuk-grid-column-full" style={{display: 'flex', flexDirection: 'row'}}>
            <div style={{width: '70%'}}>
              <div className="govuk-heading-l" style={{margin: '3%', whiteSpace: 'pre-line'}}>
                {t('title')}
              </div>
              <div style={{margin: '3%', whiteSpace: 'pre-line', color: '#fff'}}>
                {t('subtitle')}
              </div>
            </div>
            {withMenu &&
              <div style={{width: '30%', display: 'flex', flexDirection: 'column', padding: '2%', background: '#000000'}}>
                {['goals', 'phases', 'public', 'workflow'].map((section) => (
                  <Link key={section} to={`/${section}`} className="idsk-header__link" style={{padding: '2%'}}>
                    <strong>{t(`${section}.title`)}</strong>
                  </Link>
                ))}
              </div>}
          </div>
        </div>
      </div>
    </div>
  )
}
