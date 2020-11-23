package main

import "github.com/slovak-egov/einvoice/web-app/server/app"

func main() {
	a := app.NewApp()

	a.Run()
}
