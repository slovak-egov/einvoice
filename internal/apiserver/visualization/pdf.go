package visualization

import (
	"fmt"
	"strings"

	"github.com/jung-kurt/gofpdf"
	"github.com/lestrrat-go/libxml2"
	"github.com/lestrrat-go/libxml2/clib"
	"github.com/lestrrat-go/libxml2/types"
)

const (
	lineHeight = 5
	tabSize    = 4
	font       = "Arial"
)

var pageHeight float64

func generateLines(currentNode types.Node, level int, pdf *gofpdf.Fpdf) error {
	if currentNode.NodeType() == clib.ElementNode {
		if pdf.GetX() > pageHeight {
			pdf.AddPage()
		}

		// Write padding
		for i := 0; i < tabSize*(level-1); i++ {
			pdf.Write(lineHeight, " ")
		}

		// Write node name in bold red
		nodeNameParts := strings.Split(currentNode.NodeName(), ":")
		name := nodeNameParts[len(nodeNameParts)-1]
		pdf.SetTextColor(186, 24, 24)
		pdf.SetFontStyle("B")
		pdf.Write(lineHeight, name)

		// Reset font and text color for writing tag value
		pdf.SetFontStyle("")
		pdf.SetTextColor(0, 0, 0)

		// Write value
		// Check if node contains value and write it
		if child, err := currentNode.FirstChild(); err == nil && child.NodeType() == clib.TextNode {
			pdf.Write(lineHeight, ": "+strings.TrimSpace(child.TextContent()))
		}

		// Write tag attributes in yellow
		pdf.SetTextColor(191, 143, 31)
		if e, ok := currentNode.(types.Element); ok {
			attrs, err := e.Attributes()
			if err != nil {
				return err
			}
			for _, attr := range attrs {
				// Skip xsi attributes
				if strings.HasPrefix(attr.NodeName(), "xsi:") {
					continue
				}
				pdf.Write(lineHeight, fmt.Sprintf(" (%s=%s)", attr.NodeName(), attr.TextContent()))
			}
		}
		pdf.SetTextColor(0, 0, 0)

		// Break line
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
