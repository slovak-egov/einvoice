package visualization

import (
	"fmt"
	"strings"

	"github.com/jung-kurt/gofpdf"
	"github.com/lestrrat-go/libxml2"
	"github.com/lestrrat-go/libxml2/clib"
	"github.com/lestrrat-go/libxml2/types"
)

var lineHeight float64 = 5
var tabSize = 4
var font = "Arial"
var pageHeight float64

func generateLines(n types.Node, level int, pdf *gofpdf.Fpdf) error {
	if n.NodeType() == clib.ElementNode {
		if pdf.GetX() > pageHeight {
			pdf.AddPage()
		}

		for i := 0; i < tabSize*(level-1); i++ {
			pdf.Write(lineHeight, " ")
		}

		nodeNameParts := strings.Split(n.NodeName(), ":")
		name := nodeNameParts[len(nodeNameParts)-1]
		value := ""
		if child, err := n.FirstChild(); err == nil && child.NodeType() == clib.TextNode {
			value = strings.TrimSpace(child.TextContent())
		}

		pdf.SetTextColor(186, 24, 24)
		pdf.SetFontStyle("B")
		pdf.Write(lineHeight, name)
		pdf.SetFontStyle("")
		pdf.SetTextColor(0, 0, 0)

		if value != "" {
			pdf.Write(lineHeight, ": "+value)
		}

		pdf.SetTextColor(191, 143, 31)
		if e, ok := n.(types.Element); ok {
			attrs, err := e.Attributes()
			if err != nil {
				return err
			}
			for _, attr := range attrs {
				if !strings.HasPrefix(attr.NodeName(), "xsi:") {
					pdf.Write(lineHeight, fmt.Sprintf(" (%s=%s)", attr.NodeName(), attr.TextContent()))
				}
			}
		}

		pdf.Write(lineHeight, "\n")
	}

	children, err := n.ChildNodes()
	if err != nil {
		return err
	}
	for _, child := range children {
		if err = generateLines(child, level+1, pdf); err != nil {
			return nil
		}
	}

	return nil
}

func GeneratePdf(invoiceBytes []byte) (*File, error) {
	xml, err := libxml2.Parse(invoiceBytes)
	if err != nil {
		return nil, err
	}

	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.SetFont(font, "", lineHeight)
	pdf.SetFontUnitSize(lineHeight)
	_, pageHeight = pdf.GetPageSize()

	pdf.AddPage()

	err = generateLines(xml, 0, pdf)
	if err != nil {
		return nil, err
	}

	return &File{pdf}, nil
}
