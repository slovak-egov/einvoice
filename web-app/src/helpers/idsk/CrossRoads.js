import {Fragment} from 'react'
import Link from './Link'

export default ({items}) => (
  <div className="idsk-crossroad-1">
    {items.map((item, index) => (
      <Fragment key={index}>
        <Link to={item.to} className="idsk-crossroad-title">{item.title}</Link>
        {item.description && <p className="idsk-crossroad-subtitle">{item.description}</p>}
        <hr className="idsk-crossroad-line" />
      </Fragment>
    ))}
  </div>
)
