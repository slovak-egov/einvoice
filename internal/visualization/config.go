package visualization

import "github.com/slovak-egov/einvoice/pkg/environment"

type Configuration struct {
	FontsDirectory string
	TemplatePath   string
}

func NewConfig(defaultConfig Configuration) Configuration {
	return Configuration{
		FontsDirectory: environment.Getenv("FONTS_DIRECTORY", defaultConfig.FontsDirectory),
		TemplatePath:   environment.Getenv("INVOICE_TEMPLATE_DIRECTORY", defaultConfig.TemplatePath),
	}
}
