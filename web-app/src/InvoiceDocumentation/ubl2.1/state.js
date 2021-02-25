import {get} from 'lodash'
import {ubl21DocsSelector} from '../../cache/documentation/state'

// Distinguish path to child and attribute
const getElementPath = (v) => {
  if (v.startsWith('@')) return ['attributes', v.slice(1)]
  else return ['children', v]
}

export const tagDocsSelector = (tagPath) => (state) => {
  const path = tagPath.flatMap((v, i) => i === 0 ? [v] : getElementPath(v))
  return get(ubl21DocsSelector(state), path)
}
