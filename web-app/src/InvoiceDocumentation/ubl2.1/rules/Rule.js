import {useSelector} from 'react-redux'
import {Card, Col, Row} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'
import NotFound from '../../../helpers/NotFound'
import {ubl21RulesDocsSelector} from '../../../cache/documentation/state'

export default ({location}) => {
  const {i18n, t} = useTranslation('common')

  const ruleId = location.pathname.split('/')[3]
  const docs = useSelector(ubl21RulesDocsSelector)

  // Rule does not exist in invoice rules documentation
  if (docs == null || !docs[ruleId]) return <NotFound />

  const rule = docs[ruleId]

  return (
    <Card>
      <Card.Header className="bg-primary text-white text-center" as="h3">
        {ruleId}
      </Card.Header>
      <Card.Body>
        <Row>
          <Col className="font-weight-bold" sm="3">{t('invoiceDocs.rules.message')}</Col>
          <Col sm="9">{rule.message[i18n.language]}</Col>
        </Row>
        <Row>
          <Col className="font-weight-bold" sm="3">{t('invoiceDocs.rules.context')}</Col>
          <Col sm="9"><code>{rule.context}</code></Col>
        </Row>
        <Row>
          <Col className="font-weight-bold" sm="3">{t('invoiceDocs.rules.test')}</Col>
          <Col sm="9"><code>{rule.test}</code></Col>
        </Row>
        <Row>
          <Col className="font-weight-bold" sm="3">{t('invoiceDocs.rules.flag')}</Col>
          <Col sm="9">{t(`invoiceDocs.rules.flags.${rule.flag}`)}</Col>
        </Row>
      </Card.Body>
    </Card>
  )
}
