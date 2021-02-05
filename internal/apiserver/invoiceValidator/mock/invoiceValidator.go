package mock

import (
	goContext "context"
)

type InvoiceValidator struct{}

func (v *InvoiceValidator) ValidateD16B(ctx goContext.Context, xml []byte) error {
	return nil
}

func (v *InvoiceValidator) ValidateUBL21(ctx goContext.Context, xml []byte) error {
	return nil
}
