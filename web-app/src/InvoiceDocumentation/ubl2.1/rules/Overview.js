import {useSelector} from 'react-redux'
import {Link} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {Table} from '../../../helpers/idsk'
import {ubl21RulesDocsSelector} from '../../../cache/documentation/state'

export default ({match}) => {
  const {i18n, t} = useTranslation('common')
  const docs = useSelector(ubl21RulesDocsSelector)

  return (
    <>
      <h1 className="govuk-heading-l">{t('invoiceDocs.ublRules')}</h1>
      <Table
        head={[
          {children: t('invoiceDocs.rules.identifier')},
          {children: t('invoiceDocs.rules.message')},
          {children: t('invoiceDocs.rules.flag')},
        ]}
        rows={Object.entries(docs).map(([id, rule], index) => [
          {children: <Link to={`${match.url}/${id}`}>{id}</Link>},
          {children: rule.message[i18n.language]},
          {children: t(`invoiceDocs.rules.flags.${rule.flag}`)},
        ])}
      />
    </>
  )
}
