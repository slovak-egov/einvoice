package app

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"reflect"
	"testing"
)

func TestSubstitute(t *testing.T) {
	t.Cleanup(cleanDb(t))
	user1, token1, ico1 := createTestUser(t)
	user2, token2, ico2 := createTestUser(t)

	var parsedInts []int
	var parsedStrings []string

	t.Run("add substitute", func(t *testing.T) {
		exp := []int{user2.Id}
		data, _ := json.Marshal([]int{user2.Id})

		req, _ := http.NewRequest("POST", substituteReq(user1.Id), bytes.NewReader(data))
		response := executeAuthRequest(req, token1)
		checkResponseCode(t, http.StatusOK, response.Code)
		json.Unmarshal(response.Body.Bytes(), &parsedInts)

		if !reflect.DeepEqual(exp, parsedInts) {
			t.Errorf("Expected %v. Got %v\n", exp, parsedInts)
		}
	})

	t.Run("get substitutes for user1", func(t *testing.T) {
		exp := []int{user2.Id}

		req, _ := http.NewRequest("GET", substituteReq(user1.Id), nil)
		response := executeAuthRequest(req, token1)
		checkResponseCode(t, http.StatusOK, response.Code)
		json.Unmarshal(response.Body.Bytes(), &parsedInts)

		if !reflect.DeepEqual(exp, parsedInts) {
			t.Errorf("Expected %v. Got %v\n", exp, parsedInts)
		}
	})

	t.Run("get organizations for user1", func(t *testing.T) {
		exp := []string{ico1}

		req, _ := http.NewRequest("GET", organizationReq(user1.Id), nil)
		response := executeAuthRequest(req, token1)
		checkResponseCode(t, http.StatusOK, response.Code)
		json.Unmarshal(response.Body.Bytes(), &parsedStrings)

		if !reflect.DeepEqual(exp, parsedStrings) {
			t.Errorf("Expected %v. Got %v\n", exp, parsedStrings)
		}
	})

	t.Run("get substitutes for user2", func(t *testing.T) {
		req, _ := http.NewRequest("GET", substituteReq(user2.Id), nil)
		response := executeAuthRequest(req, token2)
		checkResponseCode(t, http.StatusOK, response.Code)
		json.Unmarshal(response.Body.Bytes(), &parsedInts)

		if len(parsedInts) > 0 {
			t.Errorf("Expected empty array. Got %v\n", parsedInts)
		}
	})

	t.Run("get organizations for user2", func(t *testing.T) {
		exp := []string{ico1, ico2}

		req, _ := http.NewRequest("GET", organizationReq(user2.Id), nil)
		response := executeAuthRequest(req, token2)
		checkResponseCode(t, http.StatusOK, response.Code)
		json.Unmarshal(response.Body.Bytes(), &parsedStrings)

		if !reflect.DeepEqual(exp, parsedStrings) {
			t.Errorf("Expected %v. Got %v\n", exp, parsedStrings)
		}
	})

	t.Run("delete substitute", func(t *testing.T) {
		exp := []int{user2.Id}
		data, _ := json.Marshal([]int{user2.Id})

		req, _ := http.NewRequest("DELETE", substituteReq(user1.Id), bytes.NewReader(data))
		response := executeAuthRequest(req, token1)
		checkResponseCode(t, http.StatusOK, response.Code)
		json.Unmarshal(response.Body.Bytes(), &parsedInts)

		if !reflect.DeepEqual(exp, parsedInts) {
			t.Errorf("Expected %v. Got %v\n", exp, parsedInts)
		}
	})

	t.Run("get substitutes after deletion", func(t *testing.T) {
		req, _ := http.NewRequest("GET", substituteReq(user1.Id), nil)
		response := executeAuthRequest(req, token1)
		checkResponseCode(t, http.StatusOK, response.Code)
		json.Unmarshal(response.Body.Bytes(), &parsedInts)

		if len(parsedInts) > 0 {
			t.Errorf("Expected empty array. Got %v\n", parsedInts)
		}
	})

	t.Run("get organizations after deletion", func(t *testing.T) {
		exp := []string{ico2}

		req, _ := http.NewRequest("GET", organizationReq(user2.Id), nil)
		response := executeAuthRequest(req, token2)
		checkResponseCode(t, http.StatusOK, response.Code)
		json.Unmarshal(response.Body.Bytes(), &parsedStrings)

		if !reflect.DeepEqual(exp, parsedStrings) {
			t.Errorf("Expected %v. Got %v\n", exp, parsedStrings)
		}
	})
}

func substituteReq(userId int) string {
	return fmt.Sprintf("/users/%d/substitutes", userId)
}

func organizationReq(userId int) string {
	return fmt.Sprintf("/users/%d/organizations", userId)
}
