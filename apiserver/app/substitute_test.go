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

	t.Run("add substitute", func(t *testing.T) {
		testRequest(t, "POST", substituteReqUrl(user1.Id), token1, []int{user2.Id}, []int{user2.Id})
	})

	t.Run("get substitutes for user1", func(t *testing.T) {
		testRequest(t, "GET", substituteReqUrl(user1.Id), token1, nil, []int{user2.Id})
	})

	t.Run("get organizations for user1", func(t *testing.T) {
		testRequest(t, "GET", organizationReqUrl(user1.Id), token1, nil, []string{ico1})
	})

	t.Run("get substitutes for user2", func(t *testing.T) {
		testRequest(t, "GET", substituteReqUrl(user2.Id), token2, nil, []int{})
	})

	t.Run("get organizations for user2", func(t *testing.T) {
		testRequest(t, "GET", organizationReqUrl(user2.Id), token2, nil, []string{ico1, ico2})
	})

	t.Run("delete substitute", func(t *testing.T) {
		testRequest(t, "DELETE", substituteReqUrl(user1.Id), token1, []int{user2.Id}, []int{user2.Id})
	})

	t.Run("get substitutes after deletion", func(t *testing.T) {
		testRequest(t, "GET", substituteReqUrl(user1.Id), token1, nil, []int{})
	})

	t.Run("get organizations after deletion", func(t *testing.T) {
		testRequest(t, "GET", organizationReqUrl(user2.Id), token2, nil, []string{ico2})
	})
}

func testRequest(t *testing.T, method, url, token string, body, exp interface{}) {
	var reader io.Reader
	if body != nil {
		data, _ := json.Marshal(body)
		reader = bytes.NewReader(data)
	}
	req, _ := http.NewRequest(method, url, reader)
	response := executeAuthRequest(req, token)

	checkResponseCode(t, http.StatusOK, response.Code)
	expBytes, _ := json.Marshal(exp)

	assert.Equal(t, string(expBytes), string(response.Body.Bytes()))

}
