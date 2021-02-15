import {createStore, applyMiddleware} from 'redux'
import {createLogger} from 'redux-logger'
import thunkMiddleware from 'redux-thunk'
import rootReducer from './rootReducer'
import Api from './api'

export default () => {
  const initialState = undefined
  const loggerMiddleware = createLogger()

  const api = new Api()

  const middlewares = [
    thunkMiddleware.withExtraArgument({api}),
  ]

  if (process.env.NODE_ENV === 'development') {
    middlewares.push(
      loggerMiddleware,
    )
  }

  const enhancer = applyMiddleware(...middlewares)

  return createStore(rootReducer, initialState, enhancer)
}
