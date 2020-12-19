package app

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
)

func substituteReqUrl(userId int) string {
	return fmt.Sprintf("/users/%d/substitutes", userId)
}

func organizationReqUrl(userId int) string {
	return fmt.Sprintf("/users/%d/organizations", userId)
}

func TestSubstitute(t *testing.T) {
	t.Cleanup(cleanDb(t))
	ico1 := "10000001"
	ico2 := "10000002"
	user1, token1 := createTestUser(t, ico1)
	user2, token2 := createTestUser(t, ico2)

	var flagtests = []struct {
		name     string
		method   string
		url      string
		token    string
		body     interface{}
		response interface{}
	}{
		{"add substitute", "POST", substituteReqUrl(user1.Id), token1, []int{user2.Id}, []int{user2.Id}},
		{"get substitutes for user1", "GET", substituteReqUrl(user1.Id), token1, nil, []int{user2.Id}},
		{"get organizations for user1", "GET", organizationReqUrl(user1.Id), token1, nil, []string{ico1}},
		{"get substitutes for user2", "GET", substituteReqUrl(user2.Id), token2, nil, []int{}},
		{"get organizations for user2", "GET", organizationReqUrl(user2.Id), token2, nil, []string{ico1, ico2}},
		{"delete substitute", "DELETE", substituteReqUrl(user1.Id), token1, []int{user2.Id}, []int{user2.Id}},
		{"get substitutes after deletion", "GET", substituteReqUrl(user1.Id), token1, nil, []int{}},
		{"get organizations after deletion", "GET", organizationReqUrl(user2.Id), token2, nil, []string{ico2}},
	}
	for _, tt := range flagtests {
		t.Run(tt.name, func(t *testing.T) {
			var reader io.Reader
			if tt.body != nil {
				data, err := json.Marshal(tt.body)
				if err != nil {
					t.Error(err.Error())
				}
				reader = bytes.NewReader(data)
			}
			req, err := http.NewRequest(tt.method, tt.url, reader)
			if err != nil {
				t.Error(err.Error())
			}
			response := executeAuthRequest(req, tt.token)

			checkResponseCode(t, http.StatusOK, response.Code)
			expBytes, err := json.Marshal(tt.response)
			if err != nil {
				t.Error(err.Error())
			}

			assert.Equal(t, expBytes, response.Body.Bytes())
		})
	}
}
