export default ({value}) => (
  <div>
    {value ?
      <i className="fas fa-check text-success" /> :
      <i className="fas fa-times text-danger" />}
  </div>
)
