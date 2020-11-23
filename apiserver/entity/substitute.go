package entity

import "time"

type Substitute struct {
	CreatedAt    time.Time `json:"createdAt"`
	OwnerId      int       `json:"ownerId"`
	SubstituteId int       `json:"substituteId"`
}
