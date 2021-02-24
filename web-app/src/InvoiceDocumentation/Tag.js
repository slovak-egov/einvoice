import {useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Link, useLocation} from 'react-router-dom'
import {Card, Col, Row, Table} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'
import {last} from 'lodash'
import NotFound from '../helpers/NotFound'
import {tagDocsSelector} from './state'
import {getUblDocs} from '../cache/documentation/actions'
import {isUblDocsLoadedSelector} from '../cache/documentation/state'

const displayCardinality = (card) => typeof card === 'object' ? `${card.from}..${card.to}` : card

const TagDescendantsTable = ({descendants, attributes}) => {
  const {i18n, t} = useTranslation('common')
  const location = useLocation()

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
        {Object.entries(descendants).map(([name, child], index) => {
          // Add @ for attributes in URL, so we can distinguish attributes from children
          const childName = `${attributes ? '@' : ''}${name}`
          return (
            <tr key={index}>
              <td>{displayCardinality(child.cardinality)}</td>
              <td>
                <Link to={`${location.pathname}/${childName}`}>{childName}</Link>
              </td>
              <td>{child.description[i18n.language]}</td>
            </tr>
          )
        })}
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

  const tagPath = location.pathname.split('/').slice(3)

  const docs = useSelector(tagDocsSelector(tagPath))

  // Data is loading
  if (!isLoaded) return null
  // Tag does not exist in invoice documentation
  if (docs == null) return <NotFound />

  return (
    <Card>
      <Card.Header className="bg-primary text-white text-center" as="h3">
        {last(tagPath)}
      </Card.Header>
      <Card.Body>
        <p className="lead">{docs.description[i18n.language]}</p>
        <Row>
          <Col className="font-weight-bold" sm="3">{t('invoiceDocs.cardinality.full')}</Col>
          <Col sm="9">{displayCardinality(docs.cardinality)}</Col>
        </Row>
        {docs.dataType && <Row>
          <Col className="font-weight-bold" sm="3">{t('invoiceDocs.dataType')}</Col>
          <Col sm="9">{docs.dataType}</Col>
        </Row>}
        {docs.businessTerms && <Row>
          <Col className="font-weight-bold" sm="3">{t('invoiceDocs.businessTerms')}</Col>
          <Col sm="9">{docs.businessTerms}</Col>
        </Row>}
        {docs.codeLists && <Row>
          <Col className="font-weight-bold" sm="3">{t('invoiceDocs.codeLists')}</Col>
          <Col sm="9">
            {docs.codeLists.map((codeList, i) => (
              <>
                {i !== 0 && <span>, </span>}
                <Link key={i} to={`/invoice-documentation/codeLists/${codeList}`}>{codeList}</Link>
              </>
            ))}
          </Col>
        </Row>}
        {docs.attributes && <Row>
          <Col className="font-weight-bold" sm="3">{t('invoiceDocs.attributes')}</Col>
          <Col sm="9">
            <TagDescendantsTable descendants={docs.attributes} attributes />
          </Col>
        </Row>}
        {docs.children && <Row>
          <Col className="font-weight-bold" sm="3">{t('invoiceDocs.childElements')}</Col>
          <Col sm="9">
            <TagDescendantsTable descendants={docs.children} />
          </Col>
        </Row>}
      </Card.Body>
    </Card>
  )
}
