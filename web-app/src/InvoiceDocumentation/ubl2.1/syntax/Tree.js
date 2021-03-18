import {useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {Link, useRouteMatch} from 'react-router-dom'
import {Table} from '../../../helpers/idsk'
import {displayCardinality} from './helpers'

const getTableRows = (docs, path, language, baseUrl) => {
  const result = [[
    {
      children: displayCardinality(docs.cardinality),
      style: {width: '5%'},
    },
    {
      children: (
        <>
          <span>{'• '.repeat(path.length - 1)}</span>
          <Link to={`${baseUrl}/${path.join('/')}`}>{path[path.length - 1]}</Link>
        </>
      ),
      style: {width: '15%'},
    },
    {
      children: (
        <>
          <strong>{docs.name[language]}</strong>
          <div>{docs.description[language]}</div>
        </>
      ),
      className: 'd-none-mobile',
    },
  ]]

  if (docs.attributes != null) {
    for (const [attrName, attr] of Object.entries(docs.attributes)) {
      result.push(...getTableRows(attr, [...path, `@${attrName}`], language, baseUrl))
    }
  }

  if (docs.children != null) {
    for (const [childName, child] of Object.entries(docs.children)) {
      result.push(...getTableRows(child, [...path, childName], language, baseUrl))
    }
  }
  return result
}

export default ({docs, rootTag}) => {
  const {i18n, t} = useTranslation('common')
  const match = useRouteMatch()
  const tableRows = useMemo(
    () => getTableRows(docs[rootTag], [rootTag], i18n.language, match.url),
    [docs, i18n.language, match.url],
  )

  return (
    <>
      <h1 className="govuk-heading-l">{t('invoiceDocs.ublInvoice')}</h1>
      <Table
        head={[
          {children: t('invoiceDocs.cardinality.short')},
          {children: t('invoiceDocs.name')},
          {
            children: t('invoiceDocs.description'),
            className: 'd-none-mobile',
          },
        ]}
        rows={tableRows}
      />
    </>
  )
}
