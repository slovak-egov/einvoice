package storage

import (
	goContext "context"
	"errors"
	"fmt"
	"os"

	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/pkg/context"
)

type LocalStorage struct {
	basePath string
}

func New(basePath string) *LocalStorage {
	return &LocalStorage{basePath}
}

func (storage *LocalStorage) invoiceFilename(id int) string {
	return fmt.Sprintf("%s/invoice-%d.xml", storage.basePath, id)
}

func (storage *LocalStorage) GetInvoice(ctx goContext.Context, id int) ([]byte, error) {
	bytes, err := storage.readObject(storage.invoiceFilename(id))
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return nil, &NotFoundError{fmt.Sprintf("Invoice %d not found", id)}
		} else {
			context.GetLogger(ctx).WithField("error", err.Error()).Error("localStorage.getInvoice.failed")
			return nil, err
		}
	}
	return bytes, nil
}

func (storage *LocalStorage) SaveInvoice(ctx goContext.Context, id int, value []byte) error {
	return storage.saveObject(ctx, storage.invoiceFilename(id), value)
}

func (storage *LocalStorage) DeleteInvoice(ctx goContext.Context, id int) error {
	if err := storage.deleteObject(storage.invoiceFilename(id)); err != nil {
		context.GetLogger(ctx).WithFields(log.Fields{
			"invoiceId": id,
			"error":     err.Error(),
		}).Error("localStorage.deleteInvoice.failed")
		return err
	}

	return nil
}

func (storage *LocalStorage) saveObject(ctx goContext.Context, path string, value []byte) error {
	err := os.WriteFile(path, value, 0644)
	if err != nil {
		context.GetLogger(ctx).WithField("error", err.Error()).Error("localStorage.saveObject.failed")
	}
	return err
}

func (storage *LocalStorage) readObject(path string) ([]byte, error) {
	return os.ReadFile(path)
}

func (storage *LocalStorage) deleteObject(path string) error {
	return os.Remove(path)
}
