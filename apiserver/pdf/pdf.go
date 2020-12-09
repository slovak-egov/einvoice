package pdf

import (
	"fmt"
	"strconv"

	"github.com/jung-kurt/gofpdf"

	"github.com/slovak-egov/einvoice/apiserver/entity"
)

func Generate(inv *entity.Invoice) (*File, error) {
	pdf := gofpdf.New("P", "mm", "A4", "")

	pdf.AddPage()

	pdf.SetFont("Arial", "B", 30)
	pdf.Text(30, 30, "Invoice "+strconv.Itoa(inv.Id))

	pdf.SetFont("Arial", "B", 16)

	pdf.SetFont("Arial", "B", 16)
	pdf.Text(30, 70, "Supplier")
	pdf.SetFont("Arial", "B", 10)
	pdf.Text(30, 80, "Name: "+inv.Sender)
	pdf.Text(30, 85, "ICO: "+inv.SupplierICO)

	pdf.SetFont("Arial", "B", 16)
	pdf.Text(110, 70, "Customer")
	pdf.SetFont("Arial", "B", 10)
	pdf.Text(110, 80, "Name: "+inv.Receiver)
	pdf.Text(110, 85, "ICO: "+inv.CustomerICO)

	pdf.Text(30, 110, fmt.Sprintf("Price: %v", inv.Price))

	return &File{pdf}, nil
}
