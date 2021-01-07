package main

import (
	"github.com/go-pg/migrations/v8"
	log "github.com/sirupsen/logrus"
)

func init() {
	migrations.MustRegisterTx(func(db migrations.DB) error {
		log.Println("Add column notifications_sent")
		_, err := db.Exec(`
			ALTER TABLE invoices
			ADD COLUMN notifications_sent BOOLEAN NOT NULL DEFAULT FALSE;
		`)

		return err
	}, func(db migrations.DB) error {
		log.Println("Dropping column notifications_sent")
		_, err := db.Exec(`
			ALTER TABLE invoices
			DROP COLUMN notifications_sent;
		`)

		return err
	})
}
