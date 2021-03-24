package main

import (
	"log"
	"os"

	"github.com/slovak-egov/einvoice/dev-scripts/loadTest"
	"github.com/slovak-egov/einvoice/pkg/environment"
)

func main() {
	// open log file
	logFile, err := os.OpenFile(environment.Getenv("LOG_FILE", "./error.log"), os.O_APPEND|os.O_RDWR|os.O_CREATE, 0644)
	if err != nil {
		log.Panic(err)
	}
	defer logFile.Close()

	// Set log out put and enjoy :)
	log.SetOutput(logFile)

	// optional: log date-time, filename, and line number
	log.SetFlags(log.Lshortfile | log.LstdFlags)

	a := loadTest.NewApp()

	a.Run()
}
