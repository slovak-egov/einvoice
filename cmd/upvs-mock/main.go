package main

import (
	"github.com/slovak-egov/einvoice/internal/upvs/mock"
)

func main() {
	a := upvsMock.NewApp()

	a.Run()
}
