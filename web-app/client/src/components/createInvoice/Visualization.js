import {useCallback} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Button, Card, Col, Form, Row} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'
import save from 'save-file'
import FileUploader from '../helpers/FileUploader'
import {invoiceFormats} from '../../utils/constants'
import {visualizationFormatSelector, visualizationInvoiceSelector} from '../../state/createInvoiceScreen'
import {
  getInvoiceVisualization, resetInvoiceVisualization, setInvoiceVisualizationData,
  setInvoiceVisualizationFormat,
} from '../../actions/createInvoiceScreen'

export default () => {
  const {t} = useTranslation()

  const format = useSelector(visualizationFormatSelector)
  const invoice = useSelector(visualizationInvoiceSelector)

  const dispatch = useDispatch()
  const clearInvoiceData = useCallback(
    () => dispatch(setInvoiceVisualizationData(null)), [dispatch]
  )
  const updateInvoiceData = useCallback(
    (e) => dispatch(setInvoiceVisualizationData(e.target.files[0])), [dispatch]
  )
  const updateFormat = useCallback(
    (e) => dispatch(setInvoiceVisualizationFormat(e.target.value)), [dispatch]
  )

  const visualizeInvoice = useCallback(
    async () => {
      const formData = new FormData()
      formData.append('format', format)
      formData.append('invoice', invoice)

      const visualization = await dispatch(getInvoiceVisualization(formData))
      if (visualization) {
        await save(visualization, 'invoice.pdf')
        dispatch(resetInvoiceVisualization())
      }
    },
    [dispatch, format, invoice]
  )

  return (
    <Card className="m-1">
      <Card.Header className="bg-primary text-white text-center" as="h3">
        {t('visualization')}
      </Card.Header>
      <Card.Body as={Form}>
        <Row>
          <Col>
            <Form.Group>
              <Form.Label>{t('invoice')}</Form.Label>
              <div>
                <FileUploader
                  file={invoice}
                  accept=".xml"
                  buttonStyle={{margin: 0}}
                  buttonText={t('upload')}
                  uploadFile={updateInvoiceData}
                  deleteFile={clearInvoiceData}
                />
              </div>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group>
              <Form.Label>{t('format')}</Form.Label>
              <Form.Control
                as="select"
                value={format}
                onChange={updateFormat}
                style={{width: '100px'}}
              >
                <option value={invoiceFormats.UBL}>UBL2.1</option>
                <option value={invoiceFormats.D16B}>D16B</option>
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>
        <Row className="justify-content-center">
          <Button variant="primary" onClick={visualizeInvoice}>
            {t('createVisualization')}
          </Button>
        </Row>
      </Card.Body>
    </Card>
  )
}
