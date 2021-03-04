import {useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Route, Switch} from 'react-router-dom'
import {last} from 'lodash'
import Tree from './Tree'
import Tag from './Tag'
import {
  isUblCreditNoteDocsLoadedSelector, isUblInvoiceDocsLoadedSelector, ublCreditNoteDocsSelector,
  ublInvoiceDocsSelector,
} from '../../../cache/documentation/state'
import {getUblCreditNoteDocs, getUblInvoiceDocs} from '../../../cache/documentation/actions'

const invoiceTypeData = {
  ublInvoice: {
    isLoadedSelector: isUblInvoiceDocsLoadedSelector,
    dataSelector: ublInvoiceDocsSelector,
    getDocs: getUblInvoiceDocs,
    rootTag: 'ubl:Invoice',
  },
  ublCreditNote: {
    isLoadedSelector: isUblCreditNoteDocsLoadedSelector,
    dataSelector: ublCreditNoteDocsSelector,
    getDocs: getUblCreditNoteDocs,
    rootTag: 'ubl:CreditNote',
  },
}

export default ({match}) => {
  const invoiceType = last(match.url.split('/'))
  const isLoaded = useSelector(invoiceTypeData[invoiceType].isLoadedSelector)
  const docs = useSelector(invoiceTypeData[invoiceType].dataSelector)
  const dispatch = useDispatch()

  useEffect(() => {
    if (!isLoaded) {
      dispatch(invoiceTypeData[invoiceType].getDocs())
    }
  }, [dispatch, isLoaded])

  // Data is loading
  if (!isLoaded) return null

  return (
    <Switch>
      <Route exact path={match.url}>
        <Tree docs={docs} rootTag={invoiceTypeData[invoiceType].rootTag} />
      </Route>
      <Route>
        <Tag rootDocs={docs} />
      </Route>
    </Switch>
  )
}
