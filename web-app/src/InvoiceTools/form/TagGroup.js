import {useCallback, useEffect, useState} from 'react'
import {useDispatch} from 'react-redux'
import {useTranslation} from 'react-i18next'
import {Accordion, Badge, Button, Card} from 'react-bootstrap'
import {ComplexField} from './Field'
import AddField from './AddField'
import {removeFieldInstance} from './actions'
import {pathToId} from './ids'

const Tag = ({canDelete, path, formData, docs, setErrorCount}) => {
  const {i18n, t} = useTranslation('common')
  const dispatch = useDispatch()
  const dropField = useCallback(
    () => dispatch(removeFieldInstance(path.slice(0, -1))), [path]
  )
  const [childrenErrorCount, setChildrenErrorCount] = useState({})
  const updateChildErrorCount = (child) => (newCount) => setChildrenErrorCount(
    (prevState) => ({
      ...prevState,
      [child]: newCount,
    }))
  // sum of errorCount of children
  const errorCount = Object.values(childrenErrorCount).reduce((a, b) => a + b, 0)
  const result = []

  useEffect(
    () => {
      setErrorCount(errorCount)
      return () => setErrorCount(0)
    }, [errorCount],
  )

  if (!formData.children) {
    result.push(
      <ComplexField
        key="text"
        path={[...path, 'text']}
        docs={docs}
        canDelete={canDelete}
        dropField={dropField}
        setErrorCount={updateChildErrorCount('text')}
      />
    )
  }

  // Render input fields for attributes
  if (docs.attributes) {
    for (const [name, attr] of Object.entries(docs.attributes)) {
      const attrPath = [...path, 'attributes', name]
      if (formData.attributes[name].length > 0) {
        result.push(
          <ComplexField
            key={`attr-${name}`}
            path={[...attrPath, 0, 'text']}
            docs={attr}
            canDelete={attr.cardinality.from === '0'}
            dropField={() => dispatch(removeFieldInstance(attrPath))}
            setErrorCount={updateChildErrorCount(`attr-${name}`)}
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
          id={`tag-group-${pathToId(path)}`}
        >
          <span>{docs.name[i18n.language]}</span>
          {errorCount !== 0 && <Badge variant="danger" className="d-flex ml-1">
            <span className="d-none d-md-block">{t('errorCount')}:&nbsp;</span>
            <span>{errorCount}</span>
          </Badge>}
          <div className="ml-auto">
            {canDelete &&
              <Button className="mr-sm-3" variant="danger" size="sm" onClick={dropField} id={`remove-${pathToId(path)}`}>
                {t('delete')}
              </Button>
            }
            <i className="fas fa-plus d-none d-md-inline-block" />
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
                setErrorCount={updateChildErrorCount(`child-${name}`)}
              />
            ))}
          </Card.Body>
        </Accordion.Collapse>
      </Accordion>
    )
  }

  return result
}

const TagGroup = ({path, formData, docs, setErrorCount}) => {
  const [childrenErrorCount, setChildrenErrorCount] = useState({})
  const updateChildErrorCount = (child) => (newCount) => setChildrenErrorCount(
    (prevState) => ({
      ...prevState,
      [child]: newCount,
    }))
  // sum of errorCount of children
  const errorCount = Object.values(childrenErrorCount).reduce((a, b) => a + b, 0)

  useEffect(
    () => {
      setErrorCount(errorCount)
      return () => setErrorCount(0)
    }, [errorCount],
  )

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
          setErrorCount={updateChildErrorCount(index)}
        />
      ))}
      {docs.cardinality.to !== formData.length.toString() && <AddField docs={docs} path={path} />}
    </div>
  )
}

export default TagGroup
