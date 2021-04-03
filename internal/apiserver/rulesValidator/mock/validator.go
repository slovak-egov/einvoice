package mock

import (
	goContext "context"
)

type RulesValidator struct{}

func (v *RulesValidator) Validate(ctx goContext.Context, xml []byte, format string) error {
	return nil
}
