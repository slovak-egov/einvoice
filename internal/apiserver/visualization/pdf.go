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

func generateLines(currentNode types.Node, level int, pdf *gofpdf.Fpdf) error {
	if currentNode.NodeType() == clib.ElementNode {
		if pdf.GetX() > pageHeight {
			pdf.AddPage()
		}

		// write padding
		for i := 0; i < tabSize*(level-1); i++ {
			pdf.Write(lineHeight, " ")
		}

		// write node name
		nodeNameParts := strings.Split(currentNode.NodeName(), ":")
		name := nodeNameParts[len(nodeNameParts)-1]
		// use red color
		pdf.SetTextColor(186, 24, 24)
		// use bold
		pdf.SetFontStyle("B")
		pdf.Write(lineHeight, name)
		pdf.SetFontStyle("")
		pdf.SetTextColor(0, 0, 0)

		// write value
		// check if node contains value and write it
		if child, err := currentNode.FirstChild(); err == nil && child.NodeType() == clib.TextNode {
			pdf.Write(lineHeight, ": "+strings.TrimSpace(child.TextContent()))
		}

		// write attributes
		// use yellow color
		pdf.SetTextColor(191, 143, 31)
		if e, ok := currentNode.(types.Element); ok {
			attrs, err := e.Attributes()
			if err != nil {
				return err
			}
			for _, attr := range attrs {
				// skip xsi attributes
				if strings.HasPrefix(attr.NodeName(), "xsi:") {
					continue
				}
				pdf.Write(lineHeight, fmt.Sprintf(" (%s=%s)", attr.NodeName(), attr.TextContent()))
			}
		}
		pdf.SetTextColor(0, 0, 0)

		// break line
		pdf.Write(lineHeight, "\n")
	}

	children, err := currentNode.ChildNodes()
	if err != nil {
		return err
	}
	for _, child := range children {
		if err = generateLines(child, level+1, pdf); err != nil {
			return err
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
