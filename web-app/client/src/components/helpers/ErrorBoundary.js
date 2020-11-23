import React from 'react'

export default class ErrorBoundary extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      error: null,
      errorInfo: null,
    }
  }

  componentDidCatch(error, errorInfo) {
    // Display fallback UI
    this.setState({
      error,
      errorInfo,
    })
  }

  render() {
    if (this.state.errorInfo) {
      return (
        <div>
          <h1>Something went wrong.</h1>
          <details style={{whiteSpace: 'pre-wrap'}}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
        </div>
      )
    }

    return this.props.children
  }
}
