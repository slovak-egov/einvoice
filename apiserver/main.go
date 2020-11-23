package main

import "github.com/slovak-egov/einvoice/apiserver/app"

func main() {
	a := app.NewApp()

	defer a.Close()

	a.Run()
}
