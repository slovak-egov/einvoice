package simple

import (
	"html/template"

	"github.com/slovak-egov/einvoice/internal/apiserver/metadataExtractor"
)

type TemplateMeta struct {
	IsInvoice bool
	Xml       *metadataExtractor.UblInvoiceFull
}

type Label struct {
	SK string
	EN string
}

type RowData struct {
	Label Label
	Value interface{}
}

func CreateTemplate(path string) (*template.Template, error) {
	return template.New("template.gohtml").Funcs(template.FuncMap{
		"templatePath": func() string {
			return path
		},
		"x": func() string {
			return "123"
		},
		"args": func(sk, en string, value interface{}) RowData {
			return RowData{Label{sk, en}, value}
		},
		"label": func(sk, en string) Label {
			return Label{sk, en}
		},
		"sum": func(a, b float64) float64 {
			return a + b
		},
	}).ParseGlob(path + "/*.gohtml")
}
