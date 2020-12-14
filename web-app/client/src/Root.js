import React from 'react'
import {Provider} from 'react-redux'
import {BrowserRouter} from 'react-router-dom'
import AppWrapper from './components/AppWrapper'
import ErrorBoundary from './components/helpers/ErrorBoundary'

export default ({store}) => (
  <ErrorBoundary>
    <Provider store={store}>
      <BrowserRouter>
        <AppWrapper />
      </BrowserRouter>
    </Provider>
  </ErrorBoundary>
)
