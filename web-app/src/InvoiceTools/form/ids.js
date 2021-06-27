export const pathToId = (path) => path.slice(2, path.length).map((x) => (
  x.toString().split(':').pop().split(' ').join('-')
)).filter((x) => x !== 'children').join('-')

export const camelCaseToId = (str) => str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
