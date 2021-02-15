import {OverlayTrigger, Tooltip} from 'react-bootstrap'

export default ({placement = 'top', tooltipText}) => (
  <OverlayTrigger
    placement={placement}
    overlay={<Tooltip>{tooltipText}</Tooltip>}
  >
    <i className="fas fa-info-circle ml-1" />
  </OverlayTrigger>
)
