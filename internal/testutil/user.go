package testutil

import (
	goContext "context"
	"testing"

	"github.com/slovak-egov/einvoice/internal/entity"
	"github.com/slovak-egov/einvoice/pkg/dbutil"
)

func CreateUser(t *testing.T, connector *dbutil.Connector, ctx goContext.Context, ico string) *entity.User {
	t.Helper()

	if ico == "" {
		ico = "11190993"
	}

	upvsUri := "ico://sk/" + ico
	user := &entity.User{UpvsUri: upvsUri, Name: "Frantisek"}

	if _, err := connector.GetDb(ctx).Model(user).Where("upvs_uri = ?", upvsUri).SelectOrInsert(); err != nil {
		t.Error(err)
	}

	return user
}
