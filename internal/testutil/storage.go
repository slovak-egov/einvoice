package testutil

import (
	"testing"

	"github.com/slovak-egov/einvoice/internal/storage"
)

func CleanStorage(t *testing.T, storage *storage.LocalStorage) func() {
	return func() {
		if err := storage.DeleteAll(); err != nil {
			t.Error(err)
		}
	}
}
