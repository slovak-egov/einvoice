import {useSelector} from 'react-redux'
import {Card, Table} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'
import {ubl21RulesDocsSelector} from '../../../cache/documentation/state'
import {Link} from 'react-router-dom'

export default ({match}) => {
  const {i18n, t} = useTranslation('common')
  const docs = useSelector(ubl21RulesDocsSelector)

  return (
    <Card>
      <Card.Header className="bg-primary text-white text-center" as="h3">
        {t('invoiceDocs.ublRules')}
      </Card.Header>
      <Card.Body>
        <Table striped hover responsive size="sm">
          <thead>
            <tr>
              <th>{t('invoiceDocs.rules.identifier')}</th>
              <th>{t('invoiceDocs.rules.message')}</th>
              <th>{t('invoiceDocs.rules.flag')}</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(docs).map(([id, rule], index) => (
              <tr key={index} >
                <td><Link to={`${match.url}/${id}`}>{id}</Link></td>
                <td>{rule.message[i18n.language]}</td>
                <td>{t(`invoiceDocs.rules.flags.${rule.flag}`)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  )
}
