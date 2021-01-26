package main

import "github.com/slovak-egov/einvoice/internal/apiserver"

func main() {
	a := apiserver.NewApp()

	defer a.CloseResources()

	a.Run()
}
