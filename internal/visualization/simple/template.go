package simple

import (
	"encoding/json"
	"html/template"
	"io/ioutil"

	"github.com/slovak-egov/einvoice/internal/apiserver/metadataExtractor"
)

type TemplateMeta struct {
	IsInvoice bool
	TokenQR   string
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

type CodeLists map[string]CodeList

type CodeList struct {
	Codes map[string]Code `json:"codes"`
}

type Code struct {
	Name struct {
		En string `json:"en"`
		Sk string `json:"sk"`
	}
}

func getCodeLists(codeListsPath string) (CodeLists, error) {
	bytes, err := ioutil.ReadFile(codeListsPath)
	if err != nil {
		return nil, err
	}

	var codeLists CodeLists
	err = json.Unmarshal(bytes, &codeLists)
	if err != nil {
		return nil, err
	}

	return codeLists, nil
}

func CreateTemplate(path, codeListsPath string) (*template.Template, error) {
	codeLists, err := getCodeLists(codeListsPath)
	if err != nil {
		return nil, err
	}

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
		"getCode": func(codeListName, code string) Code {
			res := codeLists[codeListName].Codes[code]
			return res
		},
	}).ParseGlob(path + "/*.gohtml")
}
