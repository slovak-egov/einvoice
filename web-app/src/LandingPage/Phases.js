import {useTranslation} from 'react-i18next'
import HeaderBanner from '../helpers/HeaderBanner'

export default () => {
  const {t} = useTranslation('LandingPage')

  return (
    <>
      <HeaderBanner withMenu />
      <div className="govuk-main-wrapper container">
        <div className="govuk-heading-l">{t('phases.title')}</div>
        <p>{t('phases.body.0')}</p>
        <table>
          {[...Array(3).keys()].map((index) => (
            <tr key={index} style={{marginTop: '5vw'}}>
              <th key={index} style={{padding: '1%', paddingBottom: '5%', verticalAlign: 'top', width: '10%'}}>{t('phases.body.1.title', {index: index + 1})}</th>
              <td key={index} style={{padding: '1%', verticalAlign: 'top', whiteSpace: 'pre-line'}}>{t(`phases.body.1.phases.${index}`)}</td>
            </tr>
          ))}
        </table>
      </div>
    </>
  )
}
