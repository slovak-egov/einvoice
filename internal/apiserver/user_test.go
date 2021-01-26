package apiserver

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"

	"github.com/slovak-egov/einvoice/internal/entity"
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

			assert.Equal(t, tt.responseStatus, response.Code)
			if tt.responseStatus == http.StatusOK {
				var parsedResponse *entity.User
				decoder := json.NewDecoder(response.Body)
				decoder.DisallowUnknownFields()
				if err := decoder.Decode(&parsedResponse); err != nil {
					t.Errorf("Response decoding failed with error %s", err.Error())
				}

				// Temporarily do not compare this field
				parsedResponse.CreatedAt = time.Time{}

				assert.Equal(t, user, parsedResponse)
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
		"upvsUri":                 user.UpvsUri,
		"serviceAccountPublicKey": *user.ServiceAccountPublicKey,
	}

	var flagtests = []struct {
		name        string
		requestBody map[string]string
	}{
		{"Set public key", map[string]string{"serviceAccountPublicKey": "1"}},
		{"Delete public key", map[string]string{"serviceAccountPublicKey": ""}},
	}
	for _, tt := range flagtests {
		t.Run(tt.name, func(t *testing.T) {
			requestBody, err := json.Marshal(tt.requestBody)
			if err != nil {
				t.Errorf("Request body serialization failed with error %s", err)
			}
			req, _ := http.NewRequest("PATCH", fmt.Sprintf("/users/%d", user.Id), bytes.NewReader(requestBody))
			response := executeAuthRequest(req, sessionToken)

			assert.Equal(t, http.StatusOK, response.Code)

			var parsedResponse map[string]interface{}
			json.Unmarshal(response.Body.Bytes(), &parsedResponse)

			for key, value := range tt.requestBody {
				expectedUserResponse[key] = value
			}

			// Temporarily do not compare these fields
			delete(parsedResponse, "id")
			delete(parsedResponse, "createdAt")

			assert.Equal(t, expectedUserResponse, parsedResponse)
		})
	}
}
