import 'react-datepicker/dist/react-datepicker.min.css'
import DatePicker from 'react-datepicker'
import {useTranslation} from 'react-i18next'
import classNames from 'classnames'

export default ({className, ...props}) => {
  const {i18n} = useTranslation()
  return (
    <DatePicker
      locale={i18n.language}
      className={classNames('govuk-input', className)}
      {...props}
    />
  )
}
