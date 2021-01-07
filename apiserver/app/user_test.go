package app

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"reflect"
	"testing"
	"time"

	"github.com/slovak-egov/einvoice/pkg/entity"
)

func TestGetUser(t *testing.T) {
	// Fill DB
	t.Cleanup(cleanDb(t))
	user, sessionToken := createTestUser(t, "")

	// Temporarily do not compare this field
	user.CreatedAt = time.Time{}

	var flagtests = []struct {
		name           string
		token          string
		responseStatus int
	}{
		{"unauthorized", "", http.StatusUnauthorized},
		{"authorized", sessionToken, http.StatusOK},
	}
	for _, tt := range flagtests {
		t.Run(tt.name, func(t *testing.T) {
			req, _ := http.NewRequest("GET", fmt.Sprintf("/users/%d", user.Id), nil)
			response := executeAuthRequest(req, tt.token)

			checkResponseCode(t, tt.responseStatus, response.Code)
			if tt.responseStatus == http.StatusOK {
				var parsedResponse *entity.User
				decoder := json.NewDecoder(response.Body)
				decoder.DisallowUnknownFields()
				if err := decoder.Decode(&parsedResponse); err != nil {
					t.Errorf("Response decoding failed with error %s", err.Error())
				}

				// Temporarily do not compare this field
				parsedResponse.CreatedAt = time.Time{}

				if !reflect.DeepEqual(parsedResponse, user) {
					t.Errorf("User data should be %v, but is %v", user, parsedResponse)
				}
			}
		})
	}
}

func TestPatchUser(t *testing.T) {
	// Fill DB
	t.Cleanup(cleanDb(t))
	user, sessionToken := createTestUser(t, "")

	expectedUserResponse := map[string]interface{}{
		"name":                    user.Name,
		"slovenskoSkUri":          user.SlovenskoSkUri,
		"serviceAccountPublicKey": *user.ServiceAccountPublicKey,
		"email":                   *user.Email,
	}

	var flagtests = []struct {
		name        string
		requestBody map[string]string
	}{
		{"Set email", map[string]string{"email": "a@mfsr.sk"}},
		{"Delete email", map[string]string{"email": ""}},
		{"Set more props", map[string]string{"email": "a@mfsr.sk", "serviceAccountPublicKey": "1"}},
	}
	for _, tt := range flagtests {
		t.Run(tt.name, func(t *testing.T) {
			requestBody, err := json.Marshal(tt.requestBody)
			if err != nil {
				t.Errorf("Request body serialization failed with error %s", err)
			}
			req, _ := http.NewRequest("PATCH", fmt.Sprintf("/users/%d", user.Id), bytes.NewReader(requestBody))
			response := executeAuthRequest(req, sessionToken)

			checkResponseCode(t, http.StatusOK, response.Code)

			var parsedResponse map[string]interface{}
			json.Unmarshal(response.Body.Bytes(), &parsedResponse)

			for key, value := range tt.requestBody {
				expectedUserResponse[key] = value
			}

			// Temporarily do not compare these fields
			delete(parsedResponse, "id")
			delete(parsedResponse, "createdAt")

			if !reflect.DeepEqual(parsedResponse, expectedUserResponse) {
				t.Errorf("User data should be %v, but is %v", expectedUserResponse, parsedResponse)
			}
		})
	}
}
