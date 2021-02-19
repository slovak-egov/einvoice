package testutil

import (
	goContext "context"
	"testing"

	"github.com/slovak-egov/einvoice/internal/entity"
	"github.com/slovak-egov/einvoice/pkg/dbutil"
)

func CleanDb(ctx goContext.Context, t *testing.T, connector *dbutil.Connector) func() {
	return func() {
		if _, err := connector.GetDb(ctx).Model(&entity.Substitute{}).Where("TRUE").Delete(); err != nil {
			t.Error(err)
		}

		if _, err := connector.GetDb(ctx).Model(&entity.Invoice{}).Where("TRUE").Delete(); err != nil {
			t.Error(err)
		}

		if _, err := connector.GetDb(ctx).Model(&entity.User{}).Where("TRUE").Delete(); err != nil {
			t.Error(err)
		}
	}
}
