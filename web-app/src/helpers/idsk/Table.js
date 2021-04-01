import classNames from 'classnames'

const Header = ({head}) => (
  <thead className="govuk-table__head">
    <tr className="govuk-table__row">
      {head.map((item, index) => {
        const {
          className: itemClassName,
          format: itemFormat,
          children: itemChildren,
          ...itemAttributes
        } = item

        return (
          <th
            key={index}
            scope="col"
            className={classNames(
              'govuk-table__header', itemClassName, itemFormat && `govuk-table__header--${itemFormat}`,
            )}
            {...itemAttributes}
          >
            {itemChildren}
          </th>
        )
      })}
    </tr>
  </thead>
)

export default ({className, firstCellIsHeader, head, rows, ...props}) => (
  <div style={{overflowX: 'auto'}}>
    <table className={classNames('govuk-table', className)} {...props}>
      {head && <Header head={head} />}
      <tbody className="govuk-table__body">
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex} className="govuk-table__row">
            {row.map((cell, cellIndex) => {
              const {
                className: cellClassName,
                children: cellChildren,
                format: cellFormat,
                ...cellAttributes
              } = cell

              if (cellIndex === 0 && firstCellIsHeader) {
                return (
                  <th
                    key={cellIndex}
                    scope="row"
                    className={classNames('govuk-table__header', cellClassName)}
                    {...cellAttributes}
                  >
                    {cellChildren}
                  </th>
                )
              }
              return (
                <td
                  key={cellIndex}
                  className={classNames(
                    'govuk-table__cell', cellClassName, cellFormat && `govuk-table__cell--${cellFormat}`,
                  )}
                  {...cellAttributes}
                >
                  {cellChildren}
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)
