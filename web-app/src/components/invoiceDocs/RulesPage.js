import {useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Link} from 'react-router-dom'
import {Card, Table} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'
import {getInvoiceRulesDocs} from '../../actions/docs'
import {areRulesLoadedSelector, invoiceRulesDocsSelector} from '../../state/docs'

export default ({match}) => {
  const {i18n, t} = useTranslation('common')
  const isLoaded = useSelector(areRulesLoadedSelector)
  const dispatch = useDispatch()

  useEffect(() => {
    if (!isLoaded) {
      dispatch(getInvoiceRulesDocs())
    }
  }, [dispatch, isLoaded])
  const rulesDocs = useSelector(invoiceRulesDocsSelector)

  // Data is loading
  if (!isLoaded) return null
  return (
    <Card>
      <Card.Header className="bg-primary text-white text-center" as="h3">
        {t('invoiceDocs.rules')}
      </Card.Header>
      <Card.Body>
        <Table striped hover responsive size="sm">
          <thead>
            <tr>
              <th>{t('error')}</th>
              <th>{t('invoiceDocs.description')}</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(rulesDocs).map((rule, index) => (
              <tr key={index}>
                <td><Link to={`${match.url}/${rule.message}`}>{rule.message}</Link></td>
                <td>{rule.description[i18n.language]}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  )
}
