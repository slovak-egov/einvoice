import Boolean from './Boolean'

export default ({value, items, ...props}) => (
  <Boolean
    items={items.map((item) => ({
      ...item,
      checked: item.value === value,
    }))}
    {...props}
    controlType="radios"
  />
)
