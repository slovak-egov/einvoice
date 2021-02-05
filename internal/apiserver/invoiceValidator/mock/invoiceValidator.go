package mock

import (
	goContext "context"
)

type TestInvoiceValidator struct{}

func (v *TestInvoiceValidator) ValidateD16B(ctx goContext.Context, xml []byte) error {
	return nil
}

func (v *TestInvoiceValidator) ValidateUBL21(ctx goContext.Context, xml []byte) error {
	return nil
}
