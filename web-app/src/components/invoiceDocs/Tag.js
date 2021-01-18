import {useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Link, useLocation} from 'react-router-dom'
import {Card, Col, Row, Table} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'
import NotFound from '../helpers/NotFound'
import {getUblDocs} from '../../actions/docs'
import {tagDocsSelector, isUblDocsLoadedSelector, ubl21DocsSelector} from '../../state/docs'
import {last} from 'lodash'

const displayCardinality = (card) => `${card.from}..${card.to}`

const TagDescendantsTable = ({descendants}) => {
  const {i18n, t} = useTranslation('common')
  const location = useLocation()
  const ubl21Docs = useSelector(ubl21DocsSelector)

  return (
    <Table striped hover responsive size="sm">
      <thead>
        <tr>
          <th>{t('invoiceDocs.cardinality.short')}</th>
          <th>{t('invoiceDocs.name')}</th>
          <th>{t('invoiceDocs.description')}</th>
        </tr>
      </thead>
      <tbody>
        {descendants.map((child, index) => (
          <tr key={index}>
            <td>{displayCardinality(ubl21Docs[child].cardinality)}</td>
            <td>
              <Link to={`${location.pathname}/${child}`}>{child}</Link>
            </td>
            <td>{ubl21Docs[child].description[i18n.language]}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

export default ({location}) => {
  const {i18n, t} = useTranslation('common')
  const isLoaded = useSelector(isUblDocsLoadedSelector)
  const dispatch = useDispatch()

  useEffect(() => {
    if (!isLoaded) {
      dispatch(getUblDocs())
    }
  }, [dispatch, isLoaded])

  const docs = useSelector(tagDocsSelector(last(location.pathname.split('/'))))

  // Data is loading
  if (!isLoaded) return null
  // Tag does not exist in invoice documentation
  if (docs == null) return <NotFound />

  return (
    <Card>
      <Card.Header className="bg-primary text-white text-center" as="h3">
        {docs.name}
      </Card.Header>
      <Card.Body>
        <p className="lead">{docs.description[i18n.language]}</p>
        <Row>
          <Col className="font-weight-bold" sm="3">{t('invoiceDocs.cardinality.full')}</Col>
          <Col sm="9">{displayCardinality(docs.cardinality)}</Col>
        </Row>
        {docs.defaultValue && <Row>
          <Col className="font-weight-bold" sm="3">{t('invoiceDocs.defaultValue')}</Col>
          <Col sm="9">{docs.defaultValue}</Col>
        </Row>}
        {docs.exampleValue && <Row>
          <Col className="font-weight-bold" sm="3">{t('invoiceDocs.exampleValue')}</Col>
          <Col sm="9">{docs.exampleValue}</Col>
        </Row>}
        {docs.businessTerms && <Row>
          <Col className="font-weight-bold" sm="3">{t('invoiceDocs.businessTerms')}</Col>
          <Col sm="9">{docs.businessTerms}</Col>
        </Row>}
        {docs.children && <Row>
          <Col className="font-weight-bold" sm="3">{t('invoiceDocs.childElements')}</Col>
          <Col sm="9">
            <TagDescendantsTable descendants={docs.children} />
          </Col>
        </Row>}
        {docs.rules && <Row>
          <Col className="font-weight-bold" sm="3">{t('invoiceDocs.rules')}</Col>
          <Col sm="9">
            <Table striped hover responsive size="sm">
              <thead>
                <tr>
                  <th>{t('error')}</th>
                </tr>
              </thead>
              <tbody>
                {docs.rules.map((rule, index) => (
                  <tr key={index}>
                    <td>
                      <Link to={`/invoice-documentation/rules/${rule}`}>
                        {rule}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>}
      </Card.Body>
    </Card>
  )
}
