package visualization

import (
	"fmt"
	"strings"

	"github.com/jung-kurt/gofpdf"
	"github.com/lestrrat-go/libxml2"
	"github.com/lestrrat-go/libxml2/clib"
	"github.com/lestrrat-go/libxml2/types"
)

var pageHeight float64 = 297
var lineHeight float64 = 5
var tab = "|   "
var topMargin float64 = 20
var bottomMargin float64 = 20
var leftMargin float64 = 20

type Lines struct {
	lines []string
}

func (ls *Lines) add(l string) {
	ls.lines = append(ls.lines, l)
}

func writeLines(pdf *gofpdf.Fpdf, lines *Lines) {
	var linesPerPage = int((pageHeight - topMargin - bottomMargin) / lineHeight)
	var lineNumber = 0

	for i, line := range lines.lines {
		if i%linesPerPage == 0 {
			lineNumber = 0
			pdf.AddPage()
		}

		pdf.Text(leftMargin, topMargin+lineHeight*float64(lineNumber), line)
		lineNumber += 1
	}
}

func generateLines(n types.Node, lines *Lines, level int) error {
	if n.NodeType() == clib.ElementNode {
		baseLine := strings.Repeat(tab, level-1)
		line := baseLine + n.NodeName()
		if child, err := n.FirstChild(); err == nil && child.NodeType() == clib.TextNode {
			value := strings.TrimSpace(child.TextContent())
			if value != "" {
				line = line + ": " + value
			}
		}

		lines.add(line)

		if e, ok := n.(types.Element); ok {
			attrs, err := e.Attributes()
			if err != nil {
				return err
			}
			for _, attr := range attrs {
				if !strings.HasPrefix(attr.NodeName(), "xsi:") {
					lines.add(fmt.Sprintf("%s%sattr:%s: %s", baseLine, tab, attr.NodeName(), attr.TextContent()))
				}
			}
		}
	}

	children, err := n.ChildNodes()
	if err != nil {
		return err
	}
	for _, child := range children {
		if err = generateLines(child, lines, level+1); err != nil {
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

	lines := &Lines{}
	err = generateLines(xml, lines, 0)

	if err != nil {
		return nil, err
	}

	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.SetFont("Arial", "", lineHeight)
	pdf.SetFontUnitSize(lineHeight)

	writeLines(pdf, lines)

	return &File{pdf}, nil
}
