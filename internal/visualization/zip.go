package visualization

import (
	"archive/zip"
	"bytes"
	"encoding/base64"
	"io"
	"strings"

	"github.com/lestrrat-go/libxml2"
	"github.com/lestrrat-go/libxml2/clib"
	"github.com/lestrrat-go/libxml2/types"

	"github.com/slovak-egov/einvoice/internal/entity"
	"github.com/slovak-egov/einvoice/internal/visualization/raw"
	"github.com/slovak-egov/einvoice/internal/visualization/simple"
)

func (v *Visualizer) GenerateZip(invoiceBytes []byte, id string) (io.Reader, error) {
	xml, err := libxml2.Parse(invoiceBytes)
	if err != nil {
		return nil, err
	}

	buf := new(bytes.Buffer)
	w := zip.NewWriter(buf)
	defer w.Close()

	// create pdf
	format, invoiceType, err := v.validator.GetFormatAndType(invoiceBytes)
	if err != nil {
		return nil, err
	}

	var pdf io.Reader
	if format == entity.UblFormat && v.validator.IsSimple(xml, invoiceType) {
		pdf, err = simple.GeneratePdf(invoiceType, v.template, invoiceBytes, id)
	} else {
		pdf, err = raw.GeneratePdf(v.fontsDir, xml)
	}
	if err != nil {
		return nil, err
	}

	pdfWriter, err := w.Create("invoice.pdf")
	if err != nil {
		return nil, err
	}

	_, err = io.Copy(pdfWriter, pdf)
	if err != nil {
		return nil, err
	}

	//write attachments
	err = xml.Walk(func(node types.Node) error {
		element, ok := node.(types.Element)
		if !ok {
			return nil
		}

		if element.NodeType() != clib.ElementNode {
			return nil
		}

		if element.NodeName() != "cbc:EmbeddedDocumentBinaryObject" {
			return nil
		}

		attrs, err := element.Attributes()
		if err != nil {
			return err
		}

		name := ""
		for _, attr := range attrs {
			if attrName := attr.NodeName(); attrName == "filename" {
				name = attr.Value()
			}
		}

		content := ""
		if child, err := node.FirstChild(); err == nil && child.NodeType() == clib.TextNode {
			content = strings.TrimSpace(child.TextContent())
		}

		contentBytes, err := base64.StdEncoding.DecodeString(content)
		if err != nil {
			return err
		}

		fileWriter, err := w.Create(name)
		if err != nil {
			return err
		}
		_, err = fileWriter.Write(contentBytes)
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	return buf, nil
}
