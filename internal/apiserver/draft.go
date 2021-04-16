package apiserver

import (
	goContext "context"
	"encoding/json"
	"net/http"
	"sort"
	"time"

	"github.com/gorilla/mux"
	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/internal/cache"
	"github.com/slovak-egov/einvoice/internal/entity"
	"github.com/slovak-egov/einvoice/internal/storage"
	"github.com/slovak-egov/einvoice/pkg/context"
	"github.com/slovak-egov/einvoice/pkg/handlerutil"
	"github.com/slovak-egov/einvoice/pkg/ulid"
)

// Get drafts metadata for user and clean old drafts
func (a *App) getDraftsMetadataForUser(ctx goContext.Context) ([]*entity.Draft, error) {
	expirationThreshold := time.Now().Add(-a.config.DraftExpiration)

	draftsMetadata, err := a.cache.GetDrafts(ctx)
	if err != nil {
		return nil, err
	}

	result := []*entity.Draft{}
	for id, name := range draftsMetadata {
		draft := &entity.Draft{
			Id:   id,
			Name: name,
		}
		draft.CalculateCreatedAt()

		if draft.CreatedAt.Before(expirationThreshold) {
			if err = a.deleteDraft(ctx, id); err != nil {
				log.WithFields(log.Fields{
					"draftId": id,
					"userId":  context.GetUserId(ctx),
					"error":   err,
				}).Error("draft.expiration.delete.failed")
			}
		} else {
			result = append(result, draft)
		}
	}

	return result, nil
}

func (a *App) getMyDrafts(res http.ResponseWriter, req *http.Request) error {
	ctx := req.Context()

	drafts, err := a.getDraftsMetadataForUser(ctx)
	if err != nil {
		return err
	}

	// Sort drafts from newest to oldest
	sort.Slice(drafts, func(i, j int) bool {
		return drafts[i].Id > drafts[j].Id
	})
	handlerutil.RespondWithJSON(res, http.StatusOK, drafts)
	return nil
}

func (a *App) getMyDraft(res http.ResponseWriter, req *http.Request) error {
	draftId := mux.Vars(req)["id"]

	_, err := a.cache.GetDraft(req.Context(), draftId)
	if err != nil {
		if _, ok := err.(*cache.NotFoundError); ok {
			return handlerutil.NewNotFoundError("draft.notFound")
		}
		return err
	}

	draftData, err := a.storage.GetDraft(req.Context(), draftId)
	if err != nil {
		if _, ok := err.(*storage.NotFoundError); ok {
			return handlerutil.NewNotFoundError("draft.notFound")
		}
		return err
	}

	handlerutil.RespondWithJSON(res, http.StatusOK, json.RawMessage(draftData))
	return nil
}

func (a *App) createMyDraft(res http.ResponseWriter, req *http.Request) error {
	ctx := req.Context()

	// Limit number of drafts
	drafts, err := a.getDraftsMetadataForUser(ctx)
	if err != nil {
		return err
	}
	if len(drafts) >= a.config.DraftsLimit {
		return handlerutil.NewTooManyRequestsError("draft.limit.reached")
	}

	req.Body = http.MaxBytesReader(res, req.Body, a.config.MaxInvoiceSize)
	var requestBody entity.Draft

	decoder := json.NewDecoder(req.Body)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(&requestBody); err != nil {
		return DraftError("body.parsingError").WithDetail(err)
	}

	if requestBody.Name == "" {
		return DraftError("name.missing")
	}

	requestBody.Id = ulid.New(time.Now().UTC()).String()
	requestBody.CalculateCreatedAt()

	err = a.storage.SaveDraft(ctx, requestBody.Id, requestBody.Data)
	if err != nil {
		return err
	}

	err = a.cache.SaveDraft(ctx, requestBody.Id, requestBody.Name)
	if err != nil {
		return err
	}

	handlerutil.RespondWithJSON(res, http.StatusCreated, requestBody)
	return nil
}

type PatchDraftRequest struct {
	Name *string         `json:"name"`
	Data json.RawMessage `json:"data,omitempty"`
}

func (a *App) updateMyDraft(res http.ResponseWriter, req *http.Request) error {
	ctx := req.Context()

	draftId := mux.Vars(req)["id"]

	var requestBody PatchDraftRequest

	decoder := json.NewDecoder(req.Body)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(&requestBody); err != nil {
		return DraftError("body.parsingError").WithDetail(err)
	}

	if requestBody.Name == nil && requestBody.Data == nil {
		return DraftError("body.empty")
	}

	draftName, err := a.cache.GetDraft(ctx, draftId)
	if err != nil {
		if _, ok := err.(*cache.NotFoundError); ok {
			return handlerutil.NewNotFoundError("draft.notFound")
		} else {
			return err
		}
	}

	if requestBody.Name != nil {
		if *requestBody.Name == "" {
			return DraftError("name.missing")
		}
		err := a.cache.SaveDraft(ctx, draftId, *requestBody.Name)
		if err != nil {
			return err
		}
		draftName = *requestBody.Name
	}

	draft := &entity.Draft{
		Id:   draftId,
		Name: draftName,
	}
	draft.CalculateCreatedAt()

	if requestBody.Data != nil {
		if err := a.storage.SaveDraft(ctx, draftId, requestBody.Data); err != nil {
			return err
		}
		draft.Data = requestBody.Data
	}

	handlerutil.RespondWithJSON(res, http.StatusOK, draft)
	return nil
}

func (a *App) deleteMyDraft(res http.ResponseWriter, req *http.Request) error {
	draftId := mux.Vars(req)["id"]
	err := a.deleteDraft(req.Context(), draftId)
	if err != nil {
		if _, ok := err.(*cache.NotFoundError); ok {
			return handlerutil.NewNotFoundError("draft.notFound")
		} else if _, ok := err.(*storage.NotFoundError); ok {
			return handlerutil.NewNotFoundError("draft.notFound")
		}
		return err
	}
	handlerutil.RespondWithJSON(res, http.StatusOK, map[string]string{"id": draftId})
	return nil
}

func (a *App) deleteDraft(ctx goContext.Context, draftId string) error {
	if err := a.cache.DeleteDraft(ctx, draftId); err != nil {
		return err
	}
	if err := a.storage.DeleteDraft(ctx, draftId); err != nil {
		return err
	}
	return nil
}
