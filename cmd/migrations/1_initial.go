package main

import (
	"github.com/go-pg/migrations/v8"
	log "github.com/sirupsen/logrus"
)

func init() {
	migrations.MustRegisterTx(func(db migrations.DB) error {
		log.Println("Creating table users")
		_, err := db.Exec(`
			CREATE TABLE users (
				id SERIAL PRIMARY KEY,
				created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
				upvs_uri VARCHAR (100) NOT NULL UNIQUE,
				name VARCHAR (100) NOT NULL,
				service_account_public_key TEXT NOT NULL DEFAULT ''
			);
		`)

		if err != nil {
			return err
		}

		log.Println("Creating table invoices")
		_, err = db.Exec(`
			CREATE TABLE invoices (
				id UUID PRIMARY KEY,
				created_by INTEGER NOT NULL references users,
				issue_date DATE NOT NULL,
				sender VARCHAR (100) NOT NULL,
				receiver VARCHAR (100) NOT NULL,
				format VARCHAR (10) NOT NULL,
				amount DECIMAL NOT NULL,
				amount_currency VARCHAR (20) NOT NULL,
				amount_without_vat DECIMAL NOT NULL,
				amount_without_vat_currency VARCHAR (20) NOT NULL,
				customer_ico VARCHAR(20) NOT NULL,
				supplier_ico VARCHAR(20) NOT NULL,
				test BOOLEAN NOT NULL DEFAULT FALSE,
				notifications_status VARCHAR(20) NOT NULL DEFAULT 'not_sent'
			);
		`)

		if err != nil {
			return err
		}

		log.Println("Creating table substitutes")
		_, err = db.Exec(`
			CREATE TABLE substitutes (
				owner_id INTEGER references users,
				substitute_id INTEGER references users,
				created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
				PRIMARY KEY (owner_id, substitute_id)
			);
		`)

		return err
	}, func(db migrations.DB) error {
		log.Println("Dropping table substitutes & invoices & users")
		_, err := db.Exec(`
			DROP TABLE substitutes, invoices, users;
		`)

		return err
	})
}
