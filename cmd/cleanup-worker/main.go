package main

import "github.com/slovak-egov/einvoice/internal/cleanup-worker"

func main() {
	w := worker.New()

	defer w.CloseResources()

	w.Run()
}
