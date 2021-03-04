import {get} from 'lodash'

export const displayCardinality = (card) => `${card.from}..${card.to}`

// Distinguish path to child and attribute
const getElementPath = (v) => {
  if (v.startsWith('@')) return ['attributes', v.slice(1)]
  else return ['children', v]
}

export const getTagDocs = (docs, tagPath) => {
  const path = tagPath.flatMap((v, i) => i === 0 ? [v] : getElementPath(v))
  return get(docs, path)
}
