package storage

import (
	goContext "context"
	"errors"
	"fmt"
	"io/ioutil"
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

func (storage *LocalStorage) invoiceFilename(id string) string {
	return fmt.Sprintf("%s/invoice:%s.xml", storage.basePath, id)
}

func (storage *LocalStorage) SaveInvoice(ctx goContext.Context, id string, value []byte) error {
	return storage.saveObject(ctx, storage.invoiceFilename(id), value)
}

func (storage *LocalStorage) GetInvoice(ctx goContext.Context, id string) ([]byte, error) {
	bytes, err := storage.readObject(storage.invoiceFilename(id))
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return nil, &NotFoundError{fmt.Sprintf("Invoice %s not found", id)}
		} else {
			context.GetLogger(ctx).WithField("error", err.Error()).Error("localStorage.getInvoice.failed")
			return nil, err
		}
	}
	return bytes, nil
}

func (storage *LocalStorage) DeleteInvoice(ctx goContext.Context, id string) error {
	if err := storage.deleteObject(storage.invoiceFilename(id)); err != nil {
		context.GetLogger(ctx).WithFields(log.Fields{
			"invoiceId": id,
			"error":     err.Error(),
		}).Error("localStorage.deleteInvoice.failed")
		return err
	}

	return nil
}

func (storage *LocalStorage) draftFilename(id string) string {
	return fmt.Sprintf("%s/draft:%s.json", storage.basePath, id)
}

func (storage *LocalStorage) SaveDraft(ctx goContext.Context, id string, value []byte) error {
	return storage.saveObject(ctx, storage.draftFilename(id), value)
}

func (storage *LocalStorage) GetDraft(ctx goContext.Context, id string) ([]byte, error) {
	bytes, err := storage.readObject(storage.draftFilename(id))
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return nil, &NotFoundError{fmt.Sprintf("Draft %s not found", id)}
		} else {
			context.GetLogger(ctx).WithField("error", err.Error()).Error("localStorage.getDraft.failed")
			return nil, err
		}
	}
	return bytes, nil
}

func (storage *LocalStorage) DeleteDraft(ctx goContext.Context, id string) error {
	if err := storage.deleteObject(storage.draftFilename(id)); err != nil {
		context.GetLogger(ctx).WithFields(log.Fields{
			"draftId": id,
			"error":   err.Error(),
		}).Error("localStorage.deleteDraft.failed")
		return err
	}

	return nil
}

func (storage *LocalStorage) DeleteAll() error {
	dir, err := ioutil.ReadDir(storage.basePath)
	if err != nil {
		return err
	}
	for _, d := range dir {
		err = os.RemoveAll(storage.basePath + "/" + d.Name())
		if err != nil {
			return nil
		}
	}
	return nil
}
