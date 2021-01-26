package main

import (
	"github.com/go-pg/migrations/v8"
	log "github.com/sirupsen/logrus"
)

func init() {
	migrations.MustRegisterTx(func(db migrations.DB) error {
		log.Println("Adding columns test & is_public")
		_, err := db.Exec(`
			ALTER TABLE invoices
			ADD COLUMN test BOOLEAN NOT NULL DEFAULT FALSE,
			ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT TRUE;
		`)

		return err
	}, func(db migrations.DB) error {
		log.Println("Dropping columns test & is_public")
		_, err := db.Exec(`
			ALTER TABLE invoices
			DROP COLUMN test,
			DROP COLUMN is_public;
		`)

		return err
	})
}
