import {get} from 'lodash'
import {set} from 'object-path-immutable'

/*
 * Forward reducer transform to a particular state path.
 * If the last path element does not exist, reducer will get undefined
 * so that you can use reduce(state=initialState(), payload) => ...
 */
export const forwardReducerTo = (reducer, path) => (
  (state, payload) => {
    const newValue = reducer(get(state, path), payload)
    return set(state, path, newValue)
  }
)

export const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result.replace('data:', '').replace(/^.+,/, ''))
    reader.onerror = (error) => reject(error)
  })

export const clearEventTarget = (e) => {
  e.target.value = null
}

export const capitalizeFirstChar = (s) => s.charAt(0).toUpperCase() + s.substring(1)
