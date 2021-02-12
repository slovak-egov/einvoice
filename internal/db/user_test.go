package db

import (
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/slovak-egov/einvoice/internal/entity"
	"github.com/slovak-egov/einvoice/internal/testutil"
)

func TestGetUserUris(t *testing.T) {
	user1 := entity.User{Id: 1, UpvsUri: "ico://sk/10000001", Name: "user1"}
	user2 := entity.User{Id: 2, UpvsUri: "ico://sk/10000002", Name: "user2"}
	user3 := entity.User{Id: 3, UpvsUri: "ico://sk/10000003", Name: "user3"}
	user4 := entity.User{Id: 4, UpvsUri: "ico://sk/10000004", Name: "user4"}
	user5 := entity.User{Id: 5, UpvsUri: "ico://sk/10000005", Name: "user5"}

	sub13 := entity.Substitute{OwnerId: 1, SubstituteId: 3}
	sub14 := entity.Substitute{OwnerId: 1, SubstituteId: 4}
	sub24 := entity.Substitute{OwnerId: 2, SubstituteId: 4}
	sub25 := entity.Substitute{OwnerId: 2, SubstituteId: 5}
	sub35 := entity.Substitute{OwnerId: 3, SubstituteId: 5}

	var flagtests = []struct {
		name        string
		substitutes []entity.Substitute
		uris        []string
	}{
		{"without substitutes", []entity.Substitute{}, []string{"ico://sk/10000001", "ico://sk/10000002"}},
		{"with one substitute", []entity.Substitute{sub13, sub25}, []string{"ico://sk/10000001", "ico://sk/10000002", "ico://sk/10000003", "ico://sk/10000005"}},
		{"with one substitute for each user", []entity.Substitute{sub13, sub24}, []string{"ico://sk/10000001", "ico://sk/10000002", "ico://sk/10000003", "ico://sk/10000004"}},
		{"with shared substitute", []entity.Substitute{sub14, sub24}, []string{"ico://sk/10000001", "ico://sk/10000002", "ico://sk/10000004"}},
		{"with nested substitutes", []entity.Substitute{sub13, sub35}, []string{"ico://sk/10000001", "ico://sk/10000002", "ico://sk/10000003"}},
	}
	for _, tt := range flagtests {
		t.Run(tt.name, func(t *testing.T) {
			t.Cleanup(testutil.CleanDb(t, connector.Connector, ctx))

			_, err := connector.GetDb(ctx).Model(&[]entity.User{user1, user2, user3, user4, user5}).Insert()
			if err != nil {
				t.Error(err)
			}

			if len(tt.substitutes) > 0 {
				_, err := connector.GetDb(ctx).Model(&tt.substitutes).Insert()
				if err != nil {
					t.Error(err)
				}
			}

			uris, err := connector.GetUserUris(ctx, []string{"10000001", "10000002"})
			if err != nil {
				t.Error(err)
			}

			assert.ElementsMatch(t, tt.uris, uris)
		})
	}
}
