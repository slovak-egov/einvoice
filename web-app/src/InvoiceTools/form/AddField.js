import {useCallback} from 'react'
import {useDispatch} from 'react-redux'
import {useTranslation} from 'react-i18next'
import {Button, Card} from 'react-bootstrap'
import {getFormInitialState} from './state'
import {addFieldInstance} from './actions'
import {pathToId} from './ids'

export default ({docs, path}) => {
  const {i18n, t} = useTranslation('common')
  const dispatch = useDispatch()
  const addField = useCallback(
    () => dispatch(addFieldInstance(path, getFormInitialState(docs))),
    [path, docs],
  )

  return (
    <Card>
      <Card.Header
        className="bg-success text-white d-flex align-items-center"
        style={{cursor: 'pointer'}}
      >
        <span>{docs.name[i18n.language]}</span>
        <div className="ml-auto">
          <Button className="mr-md-3" variant="primary" size="sm" onClick={addField} id={`add-${pathToId(path)}`}>
            {t('add')}
          </Button>
          <i className="fas fa-plus invisible d-none d-md-inline-block" />
        </div>
      </Card.Header>
    </Card>
  )
}
