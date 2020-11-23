package entity

import "time"

type User struct {
	Id                      int       `json:"id"`
	CreatedAt               time.Time `json:"createdAt"`
	SlovenskoSkUri          string    `json:"slovenskoSkUri"`
	Name                    string    `json:"name"`
	ServiceAccountPublicKey *string   `json:"serviceAccountPublicKey"`
	Email                   *string   `json:"email"`
}
