package storage

import (
	goContext "context"
	"errors"
	"fmt"
	"io/ioutil"
	"os"

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

func (storage *LocalStorage) GetInvoice(ctx goContext.Context, id int) []byte {
	bytes, err := storage.readObject(storage.invoiceFilename(id))
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return nil
		} else {
			context.GetLogger(ctx).WithField("error", err.Error()).Panic("localStorage.getInvoice.failed")
		}
	}
	return bytes
}

func (storage *LocalStorage) SaveInvoice(ctx goContext.Context, id int, value []byte) error {
	return storage.saveObject(ctx, storage.invoiceFilename(id), value)
}

func (storage *LocalStorage) saveObject(ctx goContext.Context, path string, value []byte) error {
	err := ioutil.WriteFile(path, value, 0644)
	if err != nil {
		context.GetLogger(ctx).WithField("error", err.Error()).Error("localStorage.saveObject.failed")
	}
	return err
}

func (storage *LocalStorage) readObject(path string) ([]byte, error) {
	return ioutil.ReadFile(path)
}
