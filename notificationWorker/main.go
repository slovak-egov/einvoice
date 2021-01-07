package main

import "github.com/slovak-egov/einvoice/notificationWorker/worker"

func main() {
	w := worker.New()

	defer w.CloseResources()

	w.Run()
}
