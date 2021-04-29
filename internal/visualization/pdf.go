package visualization

import (
	"github.com/jung-kurt/gofpdf"
	"github.com/lestrrat-go/libxml2/types"

	"github.com/slovak-egov/einvoice/internal/visualization/raw"
	"github.com/slovak-egov/einvoice/internal/visualization/simple"
)

func (v *Visualizer) generateRawPdf(xml types.Document) (*gofpdf.Fpdf, error) {
	return raw.GeneratePdf(v.fontsDir, xml)
}

func (v *Visualizer) generateSimplePdf(xml []byte) (*gofpdf.Fpdf, error) {
	return simple.GeneratePdf(v.fontsDir, xml)
}
