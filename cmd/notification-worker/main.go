package main

import "github.com/slovak-egov/einvoice/internal/notification-worker"

func main() {
	w := worker.New()

	defer w.CloseResources()

	w.Run()
}
