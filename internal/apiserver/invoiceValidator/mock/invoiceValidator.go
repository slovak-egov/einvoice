package mock

import (
	goContext "context"
)

type InvoiceValidator struct{}

func (v *InvoiceValidator) Validate(ctx goContext.Context, xml []byte, format, language string) error {
	return nil
}
