package visualization

import (
	"io"

	"github.com/jung-kurt/gofpdf"
)

type File struct {
	Pdf *gofpdf.Fpdf
}

func (f *File) Write(writer io.Writer) error {
	return f.Pdf.Output(writer)
}
