import React from 'react'
import {Link as ReactRouterLink} from 'react-router-dom'

const Link = ({children, to, href, forwardedRef, ...props}) => {
  if (to) {
    return (
      <ReactRouterLink innerRef={forwardedRef} to={to} {...props}>
        {children}
      </ReactRouterLink>
    )
  }
  return (
    <a ref={forwardedRef} href={href || '#'} {...props}>
      {children}
    </a>
  )
}

Link.defaultProps = {
  forwardedRef: null,
}

function forwardRef(props, ref) {
  return <Link {...props} forwardedRef={ref} />
}

forwardRef.displayName = 'LinkWithRef'

export default React.forwardRef(forwardRef)
