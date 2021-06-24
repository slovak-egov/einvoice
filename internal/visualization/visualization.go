package visualization

import (
	goContext "context"
	"html/template"
	"io"

	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/internal/db"
	"github.com/slovak-egov/einvoice/internal/entity"
	"github.com/slovak-egov/einvoice/internal/storage"
	"github.com/slovak-egov/einvoice/internal/visualization/simple"
	"github.com/slovak-egov/einvoice/internal/xsdValidator"
)

type Visualizer struct {
	fontsDir  string
	storage   *storage.LocalStorage
	db        *db.Connector
	validator *xsdValidator.XsdValidator
	template  *template.Template
}

func New(config Configuration, storage *storage.LocalStorage, db *db.Connector, validator *xsdValidator.XsdValidator) *Visualizer {
	tmpl, err := simple.CreateTemplate(config.TemplatePath)
	if err != nil {
		log.WithField("error", err.Error()).Fatal("visualization.createTemplate.failed")
	}
	return &Visualizer{
		fontsDir:  config.FontsDirectory,
		storage:   storage,
		db:        db,
		validator: validator,
		template:  tmpl,
	}
}

func (v *Visualizer) GetOrCreateVisualization(ctx goContext.Context, invoice *entity.Invoice) ([]byte, error) {
	if invoice.VisualizationCreated {
		data, err := v.storage.GetVisualization(ctx, invoice.Id)
		if err != nil {
			return nil, err
		}
		return data, nil
	}

	invoiceFile, err := v.storage.GetInvoice(ctx, invoice.Id)
	if err != nil {
		return nil, err
	}

	zipReader, err := v.GenerateZip(invoiceFile)
	if err != nil {
		return nil, err
	}

	data, err := io.ReadAll(zipReader)
	if err != nil {
		return nil, err
	}

	err = v.storage.SaveVisualization(ctx, invoice.Id, data)
	if err != nil {
		return nil, err
	}

	err = v.db.UpdateVisualizationCreatedStatus(ctx, invoice.Id, true)
	if err != nil {
		return nil, err
	}

	return data, nil
}
