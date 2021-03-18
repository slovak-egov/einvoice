package upvs

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestParseSamlToken(t *testing.T) {
	var flagtests = []struct {
		file     string
		expected SamlToken
	}{
		{
			"../../data/examples/saml/substitution.xml",
			SamlToken{
				ActorUPVSIdentityID:   "2DE0C756-63EA-4B4E-9B38-955453A6A580",
				SubjectUPVSIdentityID: "1C4D51E4-0061-4DFB-A8D8-463F24D89940",
				DelegationType:        1,
			},
		},
	}
	for _, tt := range flagtests {
		t.Run(tt.file, func(t *testing.T) {
			bytes, err := os.ReadFile(tt.file)
			if err != nil {
				t.Fatal(err)
			}

			token, err := parseSamlToken(bytes)
			if err != nil {
				t.Error(err)
			}

			assert.Equal(t, &tt.expected, token)
		})
	}
}
