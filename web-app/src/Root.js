import {Provider} from 'react-redux'
import {BrowserRouter} from 'react-router-dom'
import AppWrapper from './App'
import ErrorBoundary from './helpers/ErrorBoundary'

export default ({store}) => (
  <ErrorBoundary>
    <Provider store={store}>
      <BrowserRouter>
        <AppWrapper />
      </BrowserRouter>
    </Provider>
  </ErrorBoundary>
)
