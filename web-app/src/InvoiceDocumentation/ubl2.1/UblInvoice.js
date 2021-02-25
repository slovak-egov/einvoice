import {useMemo} from 'react'
import {useSelector} from 'react-redux'
import {Card, Table} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'
import {ubl21DocsSelector} from '../../cache/documentation/state'
import {Link} from 'react-router-dom'
import {displayCardinality} from './helpers'

const getTableRows = (docs, path) => {
  const result = [{
    cardinality: docs.cardinality,
    name: docs.name,
    description: docs.description,
    path,
  }]

  if (docs.attributes != null) {
    for (const [attrName, attr] of Object.entries(docs.attributes)) {
      result.push(...getTableRows(attr, [...path, `@${attrName}`]))
    }
  }

  if (docs.children != null) {
    for (const [childName, child] of Object.entries(docs.children)) {
      result.push(...getTableRows(child, [...path, childName]))
    }
  }
  return result
}

export default ({match}) => {
  const {i18n, t} = useTranslation('common')
  const docs = useSelector(ubl21DocsSelector)
  const tableRows = useMemo(() => getTableRows(docs['ubl:Invoice'], ['ubl:Invoice']), [docs])

  return (
    <Card>
      <Card.Header className="bg-primary text-white text-center" as="h3">
        {t('invoiceDocs.ublInvoice')}
      </Card.Header>
      <Card.Body>
        <Table striped hover responsive size="sm">
          <thead>
            <tr>
              <th style={{width: '5%'}}>{t('invoiceDocs.cardinality.short')}</th>
              <th className="w-25">{t('invoiceDocs.name')}</th>
              <th className="d-none d-md-table-cell">{t('invoiceDocs.description')}</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, index) => (
              <tr key={index}>
                <td style={{width: '5%'}}>{displayCardinality(row.cardinality)}</td>
                <td className="w-25">
                  <span>{'• '.repeat(row.path.length - 1)}</span>
                  <Link to={`${match.url}/${row.path.join('/')}`}>{row.path[row.path.length - 1]}</Link>
                </td>
                <td className="d-none d-md-table-cell">
                  <strong>{row.name[i18n.language]}</strong>
                  <div>{row.description[i18n.language]}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  )
}
