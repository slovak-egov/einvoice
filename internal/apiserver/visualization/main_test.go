package visualization_test

import (
	"os"
	"testing"
)

func TestMain(m *testing.M) {

	result := m.Run()

	os.Exit(result)
}
