package main

import (
	"github.com/go-pg/migrations/v8"
	log "github.com/sirupsen/logrus"
)

func init() {
	migrations.MustRegisterTx(func(db migrations.DB) error {
		log.Println("Adding currency columns into invoices")
		_, err := db.Exec(`
			ALTER TABLE invoices 
			ADD COLUMN amount_currency VARCHAR (5),
			ADD COLUMN amount_without_vat_currency VARCHAR (5);
			
			update invoices set amount_currency = 'EUR';
			update invoices set amount_without_vat_currency = 'EUR';
			
			ALTER TABLE invoices 
			ALTER COLUMN amount_currency SET NOT NULL,
			ALTER COLUMN amount_without_vat_currency SET NOT NULL;
		`)

		return err
	}, func(db migrations.DB) error {
		log.Println("Dropping currency columns from invoices")
		_, err := db.Exec(`
			ALTER TABLE invoices 
			DROP COLUMN amount_currency,
			DROP COLUMN amount_without_vat_currency;
		`)

		return err
	})
}
