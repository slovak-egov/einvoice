package upvsMock

import (
	"net/http"
)

func (a *App) handleSkTalkReceive(res http.ResponseWriter, req *http.Request) error {
	res.Header().Set("Content-Type", "application/json")
	res.WriteHeader(200)
	_, err := res.Write([]byte("{\"receive_result\": 0}"))
	return err
}
