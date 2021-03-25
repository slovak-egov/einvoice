package apiserver

import (
	"encoding/json"
	"net/http"
	"sort"
	"time"

	"github.com/gorilla/mux"

	"github.com/slovak-egov/einvoice/internal/cache"
	"github.com/slovak-egov/einvoice/internal/entity"
	"github.com/slovak-egov/einvoice/internal/storage"
	"github.com/slovak-egov/einvoice/pkg/handlerutil"
	"github.com/slovak-egov/einvoice/pkg/ulid"
)

func (a *App) getMyDrafts(res http.ResponseWriter, req *http.Request) error {
	draftsMetadata, err := a.cache.GetDrafts(req.Context())
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
		response = append(response, draft)
	}
	sort.Slice(response, func(i, j int) bool {
		return response[i].Id < response[j].Id
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

	handlerutil.RespondWithRawJSON(res, http.StatusOK, draftData)
	return nil
}

func (a *App) createMyDraft(res http.ResponseWriter, req *http.Request) error {
	req.Body = http.MaxBytesReader(res, req.Body, a.config.MaxDraftSize)
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

	err := a.storage.SaveDraft(req.Context(), requestBody.Id, requestBody.Data)
	if err != nil {
		return err
	}

	err = a.cache.SaveDraft(req.Context(), requestBody.Id, requestBody.Name)
	if err != nil {
		return err
	}

	handlerutil.RespondWithJSON(res, http.StatusCreated, requestBody)
	return nil
}

func (a *App) deleteMyDraft(res http.ResponseWriter, req *http.Request) error {
	draftId := mux.Vars(req)["id"]
	err := a.cache.DeleteDraft(req.Context(), draftId)
	if err != nil {
		if _, ok := err.(*cache.NotFoundError); ok {
			return handlerutil.NewNotFoundError("draft.notFound")
		}
		return err
	}
	handlerutil.RespondWithJSON(res, http.StatusOK, map[string]string{"id": draftId})
	return nil
}
