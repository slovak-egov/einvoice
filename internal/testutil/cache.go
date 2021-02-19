package testutil

import (
	"context"
	"testing"

	"github.com/google/uuid"

	"github.com/slovak-egov/einvoice/internal/cache"
	"github.com/slovak-egov/einvoice/internal/entity"
)

func CleanCache(t *testing.T, cache *cache.Cache, ctx context.Context) func() {
	return func() {
		if err := cache.FlushAll(ctx); err != nil {
			t.Error(err)
		}
	}
}

func CreateToken(t *testing.T, cache *cache.Cache, ctx context.Context, user *entity.User) string {
	t.Helper()

	sessionToken := uuid.New().String()
	err := cache.SaveUserToken(ctx, sessionToken, user.Id)
	if err != nil {
		t.Error(err)
	}

	return sessionToken
}
