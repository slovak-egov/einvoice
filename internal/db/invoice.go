package db

import (
	goContext "context"
	"errors"
	"fmt"
	"time"

	"github.com/go-pg/pg/v10"
	"github.com/go-pg/pg/v10/orm"
	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/internal/entity"
	"github.com/slovak-egov/einvoice/pkg/context"
	"github.com/slovak-egov/einvoice/pkg/dbutil"
	"github.com/slovak-egov/einvoice/pkg/timeutil"
	"github.com/slovak-egov/einvoice/pkg/ulid"
)

type PublicInvoicesOptions struct {
	Formats          []string
	StartId          string
	Limit            int
	Test             bool
	Order            string
	Amount           AmountOptions
	AmountWithoutVat AmountOptions
	IssueDate        DateOptions
	CreatedAt        TimeOptions
	CustomerName     string
	SupplierName     string
	CustomerIco      string
	SupplierIco      string
}

type AmountOptions struct {
	From     *float64
	To       *float64
	Currency string
}

type DateOptions struct {
	From *timeutil.Date
	To   *timeutil.Date
}

type TimeOptions struct {
	From *time.Time
	To   *time.Time
}

func (o *PublicInvoicesOptions) Validate(maxLimit int) error {
	if o.Limit <= 0 || o.Limit > maxLimit {
		return fmt.Errorf("limit should be positive integer less than or equal to %d", maxLimit)
	}

	if o.Order != dbutil.AscOrder && o.Order != dbutil.DescOrder {
		return errors.New("order should be either asc or desc")
	}

	return nil
}

func (o *PublicInvoicesOptions) buildQuery(query *orm.Query) *orm.Query {
	if len(o.Formats) > 0 {
		query = query.Where("format IN (?)", pg.In(o.Formats))
	}

	// If start id is not provided, do not search by id
	if o.StartId != "" {
		// If ascending order was requested, start id is the lowest id
		// otherwise it is the largest one
		if o.Order == dbutil.AscOrder {
			query = query.Where("id >= ?", o.StartId)
		} else {
			query = query.Where("id <= ?", o.StartId)
		}
	}

	// Filter out test invoices if not explicitly requested
	if !o.Test {
		query = query.Where("test = FALSE")
	}

	if o.CustomerIco != "" {
		query = query.Where("customer_ico = ?", o.CustomerIco)
	}

	if o.SupplierIco != "" {
		query = query.Where("supplier_ico = ?", o.SupplierIco)
	}

	if o.Amount.From != nil {
		// Filter out invoices with amount less then requested limit
		query = query.Where("amount >= ?", o.Amount.From)
	}

	if o.Amount.To != nil {
		// Filter out invoices with amount greater then requested limit
		query = query.Where("amount <= ?", o.Amount.To)
	}

	if o.Amount.Currency != "" {
		query = query.Where("amount_currency = ?", o.Amount.Currency)
	}

	if o.AmountWithoutVat.From != nil {
		// Filter out invoices with amount without vat less then requested limit
		query = query.Where("amount_without_vat >= ?", o.AmountWithoutVat.From)
	}

	if o.AmountWithoutVat.To != nil {
		// Filter out invoices with amount without vat greater then requested limit
		query = query.Where("amount_without_vat <= ?", o.AmountWithoutVat.To)
	}

	if o.AmountWithoutVat.Currency != "" {
		query = query.Where("amount_without_vat_currency = ?", o.AmountWithoutVat.Currency)
	}

	if o.Order == dbutil.AscOrder {
		query = query.Order("id ASC")
	} else {
		query = query.Order("id DESC")
	}

	if o.IssueDate.From != nil {
		query = query.Where("issue_date >= ?", o.IssueDate.From)
	}

	if o.IssueDate.To != nil {
		query = query.Where("issue_date <= ?", o.IssueDate.To)
	}

	if o.CreatedAt.From != nil {
		query = query.Where("id >= ?", ulid.NewFirst(*o.CreatedAt.From).String())
	}

	if o.CreatedAt.To != nil {
		query = query.Where("id <= ?", ulid.NewLast(*o.CreatedAt.To).String())
	}

	if o.CustomerName != "" {
		query = query.Where("receiver ILIKE ?", "%"+o.CustomerName+"%")
	}

	if o.SupplierName != "" {
		query = query.Where("sender ILIKE ?", "%"+o.SupplierName+"%")
	}

	return query.Limit(o.Limit + 1)
}

type UserInvoicesOptions struct {
	UserId int
	*PublicInvoicesOptions
}

func (c *Connector) GetPublicInvoices(ctx goContext.Context, options *PublicInvoicesOptions) ([]entity.Invoice, error) {
	invoices := []entity.Invoice{}
	query := c.GetDb(ctx).Model(&invoices)

	if err := options.buildQuery(query).Select(); err != nil {
		context.GetLogger(ctx).WithFields(log.Fields{
			"error":   err.Error(),
			"formats": options.Formats,
		}).Error("db.getInvoices.failed")
		return nil, err
	}

	return invoices, nil
}

func (c *Connector) GetInvoice(ctx goContext.Context, id string) (*entity.Invoice, error) {
	invoice := &entity.Invoice{}
	err := c.GetDb(ctx).Model(invoice).Where("id = ?", id).Select(invoice)
	if errors.Is(err, pg.ErrNoRows) {
		return nil, &dbutil.NotFoundError{fmt.Sprintf("Invoice %s not found", id)}
	} else if err != nil {
		context.GetLogger(ctx).WithFields(log.Fields{
			"error":     err.Error(),
			"invoiceId": id,
		}).Error("db.getInvoice.failed")
		return nil, err
	}

	return invoice, nil
}

func (c *Connector) CreateInvoice(ctx goContext.Context, invoice *entity.Invoice) error {
	_, err := c.GetDb(ctx).Model(invoice).Insert(invoice)

	if err != nil {
		context.GetLogger(ctx).WithField("error", err.Error()).Error("db.createInvoice.failed")
	}

	return err
}

func (c *Connector) GetUserInvoices(ctx goContext.Context, options *UserInvoicesOptions) ([]entity.Invoice, error) {
	invoices := []entity.Invoice{}

	query := c.GetDb(ctx).Model(&invoices).
		With("accessible_uris", c.accessibleUrisQuery(ctx, options.UserId)).
		WhereGroup(func(q *orm.Query) (*orm.Query, error) {
			return q.WhereOr("'ico://sk/' || customer_ico IN (?)", c.GetDb(ctx).Model().Table("accessible_uris")).
					WhereOr("'ico://sk/' || supplier_ico IN (?)", c.GetDb(ctx).Model().Table("accessible_uris")),
				nil
		})

	if err := options.PublicInvoicesOptions.buildQuery(query).Select(); err != nil {
		context.GetLogger(ctx).WithField("error", err.Error()).Error("db.getUserInvoices.failed")
		return nil, err
	}

	return invoices, nil
}

func (c *Connector) DeleteOldTestInvoices(ctx goContext.Context, expiration time.Duration) ([]string, error) {
	invoiceIds := []string{}
	query := c.GetDb(ctx).Model(&entity.Invoice{}).
		Where("test = TRUE").
		Where("id < ?", ulid.New(time.Now().UTC().Add(-expiration)).String()).
		Returning("id")

	if _, err := query.Delete(&invoiceIds); err != nil {
		context.GetLogger(ctx).WithField("error", err.Error()).Error("db.deleteOldTestInvoices.failed")
		return nil, err
	}

	return invoiceIds, nil
}

func (c *Connector) UpdateVisualizationCreatedStatus(ctx goContext.Context, invoiceId string, status bool) error {
	query := c.GetDb(ctx).
		Model(&entity.Invoice{}).
		Set("visualization_created = ?", status).
		Where("id = ?", invoiceId)

	if _, err := query.Update(); err != nil {
		context.GetLogger(ctx).WithFields(log.Fields{
			"error":     err.Error(),
			"invoiceId": invoiceId,
			"status":    status,
		}).Error("db.updateVisualizationCreatedStatus.failed")
		return err
	}

	return nil
}
