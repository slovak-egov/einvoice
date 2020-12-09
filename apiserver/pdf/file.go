package pdf

import (
	"github.com/jung-kurt/gofpdf"
	"io"
)

type File struct {
	Pdf *gofpdf.Fpdf
}

func (f *File) Write(writer io.Writer) error {
	return f.Pdf.Output(writer)
}
