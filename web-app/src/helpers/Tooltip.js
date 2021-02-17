import {OverlayTrigger, Tooltip} from 'react-bootstrap'
import classnames from 'classnames'

export default ({className, placement = 'top', tooltipText}) => (
  <OverlayTrigger
    placement={placement}
    overlay={<Tooltip>{tooltipText}</Tooltip>}
  >
    <i className={classnames('fas fa-info-circle ml-1', className)} />
  </OverlayTrigger>
)
