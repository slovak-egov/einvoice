package apiserver

import (
	"bytes"
	"encoding/json"
	"net/http"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"

	"github.com/slovak-egov/einvoice/internal/entity"
	"github.com/slovak-egov/einvoice/internal/testutil"
)

func TestGetMyDrafts(t *testing.T) {
	t.Cleanup(testutil.CleanDb(ctx, t, a.db.Connector))
	t.Cleanup(testutil.CleanCache(ctx, t, a.cache))
	t.Cleanup(testutil.CleanStorage(t, a.storage))

	user := testutil.CreateUser(ctx, t, a.db.Connector, "")
	sessionToken := testutil.CreateToken(ctx, t, a.cache, user)

	draft1 := testutil.CreateDraft(ctx, t, a.storage, a.cache, user.Id, "d1", "")
	draft2 := testutil.CreateDraft(ctx, t, a.storage, a.cache, user.Id, "d2", "")
	draft3 := testutil.CreateDraft(ctx, t, a.storage, a.cache, user.Id, "d3", "")
	testutil.CreateDraft(ctx, t, a.storage, a.cache, user.Id+1, "d4", "")

	req, err := http.NewRequest("GET", "/drafts", nil)
	if err != nil {
		t.Error(err)
	}

	response := testutil.ExecuteAuthRequest(a, req, sessionToken)
	assert.Equal(t, http.StatusOK, response.Code)
	var responseData []*entity.Draft
	if err = json.Unmarshal(response.Body.Bytes(), &responseData); err != nil {
		t.Error(err)
	}

	drafts := []*entity.Draft{draft1, draft2, draft3}
	for i := range drafts {
		drafts[i].Data = nil
	}
	assert.ElementsMatch(t, drafts, responseData)
}

func TestDraft(t *testing.T) {
	t.Cleanup(testutil.CleanDb(ctx, t, a.db.Connector))
	t.Cleanup(testutil.CleanCache(ctx, t, a.cache))
	t.Cleanup(testutil.CleanStorage(t, a.storage))

	user := testutil.CreateUser(ctx, t, a.db.Connector, "")
	sessionToken := testutil.CreateToken(ctx, t, a.cache, user)

	var createdDraft entity.Draft

	t.Run("Create draft", func(t *testing.T) {
		req, err := http.NewRequest("POST", "/drafts", bytes.NewReader([]byte(`{"name": "d", "data": {"x":1}}`)))
		if err != nil {
			t.Error(err)
		}

		response := testutil.ExecuteAuthRequest(a, req, sessionToken)
		assert.Equal(t, http.StatusCreated, response.Code)

		if err = json.Unmarshal(response.Body.Bytes(), &createdDraft); err != nil {
			t.Error(err)
		}
		assert.Equal(t, "d", createdDraft.Name)
		assert.Equal(t, `{"x":1}`, string(createdDraft.Data))
		assert.True(t, createdDraft.CreatedAt.Before(time.Now()))
		assert.True(t, createdDraft.CreatedAt.After(time.Now().Add(-1*time.Minute)))
	})

	t.Run("Get all drafts", func(t *testing.T) {
		req, err := http.NewRequest("GET", "/drafts", nil)
		if err != nil {
			t.Error(err)
		}

		response := testutil.ExecuteAuthRequest(a, req, sessionToken)
		assert.Equal(t, http.StatusOK, response.Code)
		var drafts []entity.Draft
		if err = json.Unmarshal(response.Body.Bytes(), &drafts); err != nil {
			t.Error(err)
		}

		assert.Equal(t, 1, len(drafts))
		assert.Equal(t, entity.Draft{createdDraft.Id, createdDraft.CreatedAt, createdDraft.Name, nil}, drafts[0])
	})

	t.Run("Get draft content", func(t *testing.T) {
		req, err := http.NewRequest("GET", "/drafts/"+createdDraft.Id, nil)
		if err != nil {
			t.Error(err)
		}

		response := testutil.ExecuteAuthRequest(a, req, sessionToken)
		assert.Equal(t, http.StatusOK, response.Code)
		assert.Equal(t, string(createdDraft.Data), string(response.Body.Bytes()))
	})

	t.Run("Delete draft", func(t *testing.T) {
		req, err := http.NewRequest("DELETE", "/drafts/"+createdDraft.Id, nil)
		if err != nil {
			t.Error(err)
		}

		response := testutil.ExecuteAuthRequest(a, req, sessionToken)
		assert.Equal(t, http.StatusOK, response.Code)
		var deletedDrafts map[string]string
		if err = json.Unmarshal(response.Body.Bytes(), &deletedDrafts); err != nil {
			t.Error(err)
		}

		assert.Equal(t, deletedDrafts["id"], createdDraft.Id)
	})

	t.Run("Get all drafts after deletion", func(t *testing.T) {
		req, err := http.NewRequest("GET", "/drafts", nil)
		if err != nil {
			t.Error(err)
		}

		response := testutil.ExecuteAuthRequest(a, req, sessionToken)
		assert.Equal(t, http.StatusOK, response.Code)
		assert.Equal(t, response.Body.String(), "[]")
	})
}
