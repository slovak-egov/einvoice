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
				slovensko_sk_uri VARCHAR (100) NOT NULL,
				name VARCHAR (100) NOT NULL,
				service_account_public_key TEXT NOT NULL DEFAULT '',
				email VARCHAR (100) NOT NULL DEFAULT ''
			);
		`)

		if err != nil {
			return err
		}

		log.Println("Creating table invoices")
		_, err = db.Exec(`
			CREATE TABLE invoices (
				id SERIAL PRIMARY KEY,
				created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
				sender VARCHAR (100) NOT NULL,
				receiver VARCHAR (100) NOT NULL,
				format VARCHAR (10) NOT NULL,
				price DECIMAL NOT NULL,
				customer_ico VARCHAR(20) NOT NULL,
				supplier_ico VARCHAR(20) NOT NULL,
				created_by INTEGER NOT NULL,
				CONSTRAINT fk_created_by
					  FOREIGN KEY(created_by)
					  REFERENCES users(id)
			);
		`)

		if err != nil {
			return err
		}

		log.Println("Creating table substitutes")
		_, err = db.Exec(`
			CREATE TABLE substitutes (
				owner_id INTEGER NOT NULL,
				substitute_id INTEGER NOT NULL,
				created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
				CONSTRAINT fk_substitute_id
					  FOREIGN KEY(substitute_id)
					  REFERENCES users(id),
				CONSTRAINT fk_owner_id
					  FOREIGN KEY(owner_id)
					  REFERENCES users(id),
				UNIQUE (owner_id, substitute_id)
			);
		`)

		return err
	}, func(db migrations.DB) error {
		log.Println("Dropping table invoices & users & substitutes")
		_, err := db.Exec(`
			DROP TABLE invoices, users, substitutes;
		`)

		return err
	})
}
