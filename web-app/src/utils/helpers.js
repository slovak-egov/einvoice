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
