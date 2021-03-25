package testutil

import (
	goContext "context"
	"testing"
	"time"

	"github.com/slovak-egov/einvoice/internal/cache"
	"github.com/slovak-egov/einvoice/internal/entity"
	"github.com/slovak-egov/einvoice/internal/storage"
	"github.com/slovak-egov/einvoice/pkg/context"
	"github.com/slovak-egov/einvoice/pkg/ulid"
)

func CreateDraft(ctx goContext.Context, t *testing.T, storage *storage.LocalStorage, cache *cache.Cache, userId int, name, data string) *entity.Draft {
	ctx = context.AddUserId(ctx, userId)

	draft := &entity.Draft{
		Id:   ulid.New(time.Now().UTC()).String(),
		Name: name,
		Data: []byte(data),
	}
	draft.CalculateCreatedAt()

	err := storage.SaveDraft(ctx, draft.Id, draft.Data)
	if err != nil {
		t.Error(err)
	}

	err = cache.SaveDraft(ctx, draft.Id, draft.Name)
	if err != nil {
		t.Error(err)
	}

	return draft
}
