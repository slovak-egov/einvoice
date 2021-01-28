import {useCallback} from 'react'
import {useDispatch} from 'react-redux'
import {useTranslation} from 'react-i18next'
import {Accordion, Button, Card} from 'react-bootstrap'
import {removeFieldInstance} from '../../../actions/invoiceForm'
import FormField from './Field'
import AddField from './AddField'

const Tag = ({canDelete, path, formData, docs}) => {
  const {i18n, t} = useTranslation('common')
  const dispatch = useDispatch()
  const dropField = useCallback(
    () => dispatch(removeFieldInstance(path.slice(0, -1))), [path]
  )
  const result = []

  if (!formData.children) {
    result.push(
      <FormField key="text" path={[...path, 'text']} docs={docs} canDelete={canDelete} dropField={dropField} />
    )
  }

  // Render input fields for attributes
  if (docs.attributes) {
    for (const [name, attr] of Object.entries(docs.attributes)) {
      const attrPath = [...path, 'attributes', name]
      if (formData.attributes[name].length > 0) {
        result.push(
          <FormField
            key={`attr-${name}`}
            path={[...attrPath, 0, 'text']}
            docs={attr}
            canDelete={attr.cardinality.from === '0'}
            dropField={() => dispatch(removeFieldInstance(attrPath))}
          />
        )
      } else {
        result.push(<AddField key={`attr-${name}`} docs={attr} path={attrPath} />)
      }
    }
  }

  // Recursively render children tags
  if (formData.children) {
    result.push(
      <Accordion key="panel" as={Card}>
        <Accordion.Toggle
          as={Card.Header}
          className="bg-primary text-white d-flex align-items-center"
          style={{cursor: 'pointer'}}
          eventKey="0"
        >
          <span>{docs.name[i18n.language]}</span>
          <div className="ml-auto">
            {canDelete &&
              <Button className="mr-sm-3" variant="danger" size="sm" onClick={dropField}>
                {t('delete')}
              </Button>
            }
            <i className="fas fa-plus d-none d-sm-inline-block" />
          </div>
        </Accordion.Toggle>
        <Accordion.Collapse eventKey="0">
          <Card.Body>
            {Object.entries(formData.children).map(([name, child]) => (
              <TagGroup
                key={`child-${name}`}
                path={[...path, 'children', name]}
                formData={child}
                docs={docs.children[name]}
              />
            ))}
          </Card.Body>
        </Accordion.Collapse>
      </Accordion>
    )
  }

  return result
}

const TagGroup = ({path, formData, docs}) => {
  // Element can be deleted only if it is last and cardinality allows smaller number of elements
  const canDeleteElement = (index) =>
    index === formData.length - 1 && docs.cardinality.from !== formData.length.toString()

  return (
    <div className="my-2">
      {formData.map((element, index) => (
        <Tag
          key={index}
          path={[...path, index]}
          formData={element}
          docs={docs}
          canDelete={canDeleteElement(index)}
        />
      ))}
      {docs.cardinality.to !== formData.length.toString() && <AddField docs={docs} path={path} />}
    </div>
  )
}

export default TagGroup
