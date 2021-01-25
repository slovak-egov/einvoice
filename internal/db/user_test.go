package db

import (
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/slovak-egov/einvoice/internal/entity"
)

func strPointer(str string) *string {
	return &str
}

func TestGetUserEmails(t *testing.T) {
	user1 := entity.User{Id: 1, SlovenskoSkUri: "ico://sk/10000001", Name: "user1", Email: strPointer("e1")}
	user2 := entity.User{Id: 2, SlovenskoSkUri: "ico://sk/10000002", Name: "user2", Email: strPointer("e2")}
	user3 := entity.User{Id: 3, SlovenskoSkUri: "ico://sk/10000003", Name: "user3", Email: strPointer("e3")}
	user4 := entity.User{Id: 4, SlovenskoSkUri: "ico://sk/10000004", Name: "user4", Email: strPointer("e4")}
	user5 := entity.User{Id: 5, SlovenskoSkUri: "ico://sk/10000005", Name: "user5", Email: strPointer("e5")}
	user6 := entity.User{Id: 6, SlovenskoSkUri: "ico://sk/10000006", Name: "user6", Email: nil}

	sub13 := entity.Substitute{OwnerId: 1, SubstituteId: 3}
	sub14 := entity.Substitute{OwnerId: 1, SubstituteId: 4}
	sub24 := entity.Substitute{OwnerId: 2, SubstituteId: 4}
	sub25 := entity.Substitute{OwnerId: 2, SubstituteId: 5}
	sub35 := entity.Substitute{OwnerId: 3, SubstituteId: 5}
	sub16 := entity.Substitute{OwnerId: 1, SubstituteId: 6}

	var flagtests = []struct {
		name        string
		substitutes []entity.Substitute
		emails      []string
	}{
		{"without substitutes", []entity.Substitute{}, []string{"e1", "e2"}},
		{"with one substitute", []entity.Substitute{sub13, sub25}, []string{"e1", "e2", "e3", "e5"}},
		{"with one substitute for each user", []entity.Substitute{sub13, sub24}, []string{"e1", "e2", "e3", "e4"}},
		{"with shared substitute", []entity.Substitute{sub14, sub24}, []string{"e1", "e2", "e4"}},
		{"with nested substitutes", []entity.Substitute{sub13, sub35}, []string{"e1", "e2", "e3"}},
		{"user without email", []entity.Substitute{sub16}, []string{"e1", "e2"}},
	}
	for _, tt := range flagtests {
		t.Run(tt.name, func(t *testing.T) {
			t.Cleanup(cleanDb(t))

			_, err := connector.GetDb(ctx).Model(&[]entity.User{user1, user2, user3, user4, user5, user6}).Insert()
			if err != nil {
				t.Error(err)
			}

			if len(tt.substitutes) > 0 {
				_, err := connector.GetDb(ctx).Model(&tt.substitutes).Insert()
				if err != nil {
					t.Error(err)
				}
			}

			emails, err := connector.GetUserEmails(ctx, []string{"10000001", "10000002"})
			if err != nil {
				t.Error(err)
			}

			assert.ElementsMatch(t, tt.emails, emails)
		})
	}
}
