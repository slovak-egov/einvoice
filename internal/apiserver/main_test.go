package apiserver

import (
	"context"
	"os"
	"testing"
)

var ctx = context.Background()

var a *App

func TestMain(m *testing.M) {
	a = NewApp()

	result := m.Run()

	a.CloseResources()

	os.Exit(result)
}
