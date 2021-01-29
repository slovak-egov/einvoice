package main

import (
	"github.com/slovak-egov/einvoice/internal/upvsMock"
)

func main() {
	a := upvsMock.NewApp()

	a.Run()
}
