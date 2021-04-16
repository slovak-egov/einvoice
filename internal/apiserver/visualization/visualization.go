package visualization

import (
	goContext "context"
	"io"

	"github.com/slovak-egov/einvoice/internal/db"
	"github.com/slovak-egov/einvoice/internal/entity"
	"github.com/slovak-egov/einvoice/internal/storage"
)

func GetOrCreateVisualization(ctx goContext.Context, invoice *entity.Invoice, storage *storage.LocalStorage, db *db.Connector) ([]byte, error) {
	if invoice.VisualizationCreated {
		data, err := storage.GetVisualization(ctx, invoice.Id)
		if err != nil {
			return nil, err
		}
		return data, nil
	}

	invoiceFile, err := storage.GetInvoice(ctx, invoice.Id)
	if err != nil {
		return nil, err
	}

	zipReader, err := GenerateZip(invoiceFile)
	if err != nil {
		return nil, err
	}

	data, err := io.ReadAll(zipReader)
	if err != nil {
		return nil, err
	}

	err = storage.SaveVisualization(ctx, invoice.Id, data)
	if err != nil {
		return nil, err
	}

	err = db.UpdateVisualizationCreatedStatus(ctx, invoice.Id, true)
	if err != nil {
		return nil, err
	}

	return data, nil
}
