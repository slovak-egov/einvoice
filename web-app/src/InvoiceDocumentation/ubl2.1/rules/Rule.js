import {useSelector} from 'react-redux'
import {Col, Row} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'
import NotFound from '../../../helpers/NotFound'
import {ubl21RuleSelector} from '../../../cache/documentation/state'

export default ({match}) => {
  const {i18n, t} = useTranslation('common')

  const ruleId = match.params.id
  const rule = useSelector(ubl21RuleSelector(ruleId))

  // Rule does not exist in invoice rules documentation
  if (rule == null) return <NotFound />

  return (
    <>
      <h1 className="govuk-heading-l">{ruleId}</h1>
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
    </>
  )
}
