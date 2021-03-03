import 'react-datepicker/dist/react-datepicker.min.css'
import DatePicker from 'react-datepicker'
import {useTranslation} from 'react-i18next'

export default (props) => {
  const {i18n} = useTranslation()
  return <DatePicker locale={i18n.language} {...props} />
}
