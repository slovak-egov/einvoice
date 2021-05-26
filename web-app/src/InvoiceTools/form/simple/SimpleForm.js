import GeneralInfo from './GeneralInfo'
import Supplier from './Supplier'
import Customer from './Customer'
import Items from './Items'
import Recapitulation from './Recapitulation'
import Notes from './Notes'

export default ({formType, path, docs}) => {
  return (
    <div>
      <GeneralInfo formType={formType} path={path} docs={docs} />
      <Supplier path={[...path, 'supplier']} docs={docs} />
      <Customer path={[...path, 'customer']} docs={docs} />
      <Items formType={formType} path={[...path, 'items']} docs={docs} />
      <Recapitulation formType={formType} path={path} docs={docs} />
      <Notes path={path} docs={docs} />
    </div>
  )
}
