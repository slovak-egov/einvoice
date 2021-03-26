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

func (a *App) getMyDrafts(res http.ResponseWriter, req *http.Request) error {
	ctx := req.Context()
	expirationThreshold := time.Now().Add(-a.config.Cache.DraftExpiration)

	draftsMetadata, err := a.cache.GetDrafts(ctx)
	if err != nil {
		return err
	}

	response := []*entity.Draft{}
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
			response = append(response, draft)
		}
	}
	sort.Slice(response, func(i, j int) bool {
		return response[i].Id > response[j].Id
	})
	handlerutil.RespondWithJSON(res, http.StatusOK, response)
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
	drafts, err := a.cache.GetDrafts(ctx)
	if err != nil {
		return err
	}
	if len(drafts) >= a.config.Cache.DraftsLimit {
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
