import React from 'react'
import {render} from 'react-dom'
import Root from './Root'
import configureStore from './configureStore'
import * as serviceWorker from './serviceWorker'
import './i18n'

const store = configureStore()

const rootElement = document.getElementById('root')

if (module.hot && typeof module.hot.accept === 'function') {
  module.hot.accept('./Root', () => {
    const NextRoot = require('./Root').default
    render(
      <NextRoot {...{store}} />,
      rootElement)
  })
}

render(
  <Root {...{store}} />,
  rootElement
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
