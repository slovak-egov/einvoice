package main

import "github.com/slovak-egov/einvoice/internal/webserver"

func main() {
	a := webserver.NewApp()

	a.Run()
}
