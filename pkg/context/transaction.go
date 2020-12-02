package context

import (
	"context"

	"github.com/go-pg/pg/v10"
)

const transactionKey = "transaction"

func AddTransaction(ctx context.Context, tx *pg.Tx) context.Context {
	return context.WithValue(ctx, transactionKey, tx)
}

func GetTransaction(ctx context.Context) *pg.Tx {
	tx := ctx.Value(transactionKey)

	if transaction, ok := tx.(*pg.Tx); ok {
		return transaction
	}

	return nil
}
