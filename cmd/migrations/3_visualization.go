package main

import (
	"github.com/go-pg/migrations/v8"
	log "github.com/sirupsen/logrus"
)

func init() {
	migrations.MustRegisterTx(func(db migrations.DB) error {
		log.Println("Adding visualization created column into invoices")
		_, err := db.Exec(`
			ALTER TABLE invoices ADD COLUMN visualization_created BOOLEAN DEFAULT FALSE NOT NULL;
		`)

		return err
	}, func(db migrations.DB) error {
		log.Println("Dropping currency columns from invoices")
		_, err := db.Exec(`
			ALTER TABLE invoices DROP COLUMN visualization_created;
		`)

		return err
	})
}
