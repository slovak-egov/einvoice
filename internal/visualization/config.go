package visualization

import "github.com/slovak-egov/einvoice/pkg/environment"

type Configuration struct {
	FontsDirectory string
}

func NewConfig(defaultConfig Configuration) Configuration {
	return Configuration{
		FontsDirectory: environment.Getenv("FONTS_DIRECTORY", defaultConfig.FontsDirectory),
	}
}
