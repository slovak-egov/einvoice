package visualization

import (
	goContext "context"
	"io"

	"github.com/slovak-egov/einvoice/internal/db"
	"github.com/slovak-egov/einvoice/internal/entity"
	"github.com/slovak-egov/einvoice/internal/storage"
	"github.com/slovak-egov/einvoice/internal/xsdValidator"
)

type Visualizer struct {
	fontsDir  string
	storage   *storage.LocalStorage
	db        *db.Connector
	validator *xsdValidator.XsdValidator
}

func New(config Configuration, storage *storage.LocalStorage, db *db.Connector, validator *xsdValidator.XsdValidator) *Visualizer {
	return &Visualizer{
		fontsDir:  config.FontsDirectory,
		storage:   storage,
		db:        db,
		validator: validator,
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
