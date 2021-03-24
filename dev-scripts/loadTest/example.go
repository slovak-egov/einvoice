package loadTest

import "os"

type Examples struct {
	UblCreditNote     []byte
	UblInvoice        []byte
	D16bInvoice       []byte
	UblViolatingRules []byte
	UblViolatingXsd   []byte
	UblLarge          []byte
}

func getFileOrPanic(path string) []byte {
	file, err := os.ReadFile(path)
	if err != nil {
		panic(err)
	}
	return file
}

func NewExamples(path string) *Examples {
	return &Examples{
		UblCreditNote:     getFileOrPanic(path+"/ubl2.1/creditNote.xml"),
		UblInvoice:        getFileOrPanic(path+"/ubl2.1/invoice.xml"),
		D16bInvoice:       getFileOrPanic(path+"/d16b/invoice.xml"),
		UblViolatingRules: getFileOrPanic(path+"/ubl2.1/invoice-rules-violation.xml"),
		UblViolatingXsd:   getFileOrPanic(path+"/ubl2.1/invoice-xsd-violation.xml"),
		UblLarge:          getFileOrPanic(path+"/ubl2.1/invoice-large.xml"),
	}
}
