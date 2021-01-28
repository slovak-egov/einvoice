package visualization

import (
	"strings"

	"github.com/jung-kurt/gofpdf"
	"github.com/lestrrat-go/libxml2"
	"github.com/lestrrat-go/libxml2/clib"
	"github.com/lestrrat-go/libxml2/types"
)

var lineHeight float64 = 5
var tab = "|   "
var font = "Arial"

type Line struct {
	level  int
	name   string
	value  string
	isAttr bool
}

type Lines struct {
	lines []Line
}

func (ls *Lines) add(l Line) {
	ls.lines = append(ls.lines, l)
}

func writeLines(pdf *gofpdf.Fpdf, lines *Lines) {
	_, pageHeight := pdf.GetPageSize()
	pdf.AddPage()

	for _, line := range lines.lines {

		if pdf.GetX() > pageHeight {
			pdf.AddPage()
		}

		pdf.SetTextColor(255, 196, 196)
		for i := 0; i < line.level-1; i++ {
			pdf.Write(lineHeight, tab)
		}

		if line.isAttr {
			pdf.SetTextColor(191, 143, 31)
		} else {
			pdf.SetTextColor(186, 24, 24)
		}
		pdf.SetFontStyle("B")
		if line.isAttr {
			pdf.Write(lineHeight, "@")
		}
		pdf.Write(lineHeight, line.name)
		pdf.SetFontStyle("")

		pdf.SetTextColor(0, 0, 0)
		if line.value != "" {
			pdf.Write(lineHeight, ": ")
			pdf.Write(lineHeight, line.value)
		}

		pdf.Write(lineHeight, "\n")
	}
}

func generateLines(n types.Node, lines *Lines, level int) error {
	if n.NodeType() == clib.ElementNode {
		line := Line{level, n.NodeName(), "", false}
		if child, err := n.FirstChild(); err == nil && child.NodeType() == clib.TextNode {
			value := strings.TrimSpace(child.TextContent())
			if value != "" {
				line.value = value
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
					lines.add(Line{level + 1, attr.NodeName(), attr.TextContent(), true})
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
	pdf.SetFont(font, "", lineHeight)
	pdf.SetFontUnitSize(lineHeight)

	writeLines(pdf, lines)

	return &File{pdf}, nil
}
