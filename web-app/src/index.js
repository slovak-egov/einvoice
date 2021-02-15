import {render} from 'react-dom'
import Root from './Root'
import configureStore from './configureStore'
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
