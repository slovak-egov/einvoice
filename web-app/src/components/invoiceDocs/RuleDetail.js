import {useEffect} from 'react'
import {Link} from 'react-router-dom'
import {Card, Col, ListGroup, Row} from 'react-bootstrap'
import {areRulesLoadedSelector, invoiceRuleDocsSelector} from '../../state/docs'
import {useDispatch, useSelector} from 'react-redux'
import {useTranslation} from 'react-i18next'
import NotFound from '../helpers/NotFound'
import {getInvoiceRulesDocs} from '../../actions/docs'

const TagPathLinks = ({tagPath}) => {
  let currentPrefix = '/invoice-documentation/syntax'
  const result = []
  for (const [i, tag] of tagPath.entries()) {
    if (i > 0) {
      result.push(<span key={2 * i - 1}> / </span>)
    }
    currentPrefix = `${currentPrefix}/${tag}`
    result.push(
      <Link key={2 * i} to={currentPrefix}>
        {tag}
      </Link>
    )
  }
  return result
}

export default ({match: {params: {rule}}}) => {
  const {i18n, t} = useTranslation('common')
  const isLoaded = useSelector(areRulesLoadedSelector)
  const dispatch = useDispatch()

  useEffect(() => {
    if (!isLoaded) {
      dispatch(getInvoiceRulesDocs())
    }
  }, [dispatch, isLoaded])
  const docs = useSelector(invoiceRuleDocsSelector(rule))

  // Data is loading
  if (!isLoaded) return null
  // Rule does not exist in invoice documentation
  if (docs == null) return <NotFound />

  return (
    <Card>
      <Card.Header className="bg-primary text-white text-center" as="h3">
        {rule}
      </Card.Header>
      <Card.Body>
        <p className="lead">{docs.description[i18n.language]}</p>
        <Row>
          <Col className="font-weight-bold" sm="3">{t('invoiceDocs.context')}</Col>
          <Col sm="9"><code>{docs.context}</code></Col>
        </Row>
        <Row>
          <Col className="font-weight-bold" sm="3">Test</Col>
          <Col sm="9"><code>{docs.test}</code></Col>
        </Row>
        <Row>
          <Col className="font-weight-bold" sm="3">{t('invoiceDocs.usage')}</Col>
          <Col sm="9">
            <ListGroup>
              {docs.usage.map((tagPath, index) => (
                <ListGroup.Item key={index}>
                  <TagPathLinks tagPath={tagPath} />
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}
