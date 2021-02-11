package upvs

import (
	goContext "context"
	"encoding/base64"
	"encoding/xml"
	"fmt"

	"github.com/google/uuid"

	"github.com/slovak-egov/einvoice/pkg/context"
)

const msgTemplate = `V e-fakturačnom systéme bola vytvorená faktúra.
Ste jednou zo zmluvných strán (alebo jednu zastupujete).
Faktúru môžete nájsť v prílohe alebo na stránke systému %[1]s.

-----------------------------------------------------

An invoice has been created in the e-invoicing system.
You are one of the contracting parties (or you substitute one of them).
You can find the invoice in the attachment or on the %[1]s system page.`

type SKTalkMessage struct {
	XMLName         xml.Name `xml:"http://gov.sk/SKTalkMessage SKTalkMessage"`
	EnvelopeVersion string
	Header          Header
	Body            Body
}

type Header struct {
	MessageInfo MessageInfo
}

type MessageInfo struct {
	Class         string
	PospID        string
	PospVersion   string
	MessageID     string
	CorrelationID string
}

type Body struct {
	MessageContainer MessageContainer
}

type MessageContainer struct {
	XMLName        xml.Name `xml:"http://schemas.gov.sk/core/MessageContainer/1.0 MessageContainer"`
	MessageId      string
	SenderId       string
	RecipientId    string
	MessageType    string
	MessageSubject string
	Objects        []Object
}

type Object struct {
	XMLName       xml.Name `xml:"Object"`
	Id            string   `xml:"Id,attr"`
	Class         string   `xml:"Class,attr"`
	MimeType      string   `xml:"MimeType,attr"`
	Encoding      string   `xml:"Encoding,attr"`
	Name          string   `xml:"Name,attr"`
	GeneralAgenda *GeneralAgenda
	Value         *string `xml:",innerxml"`
}

type GeneralAgenda struct {
	XMLName xml.Name `xml:"http://schemas.gov.sk/form/Doc.GeneralAgenda/1.2 GeneralAgenda"`
	Subject string   `xml:"subject"`
	Text    string   `xml:"text"`
}

func getFileName(invoiceId int, extension string) string {
	return fmt.Sprintf("invoice-%d.%s", invoiceId, extension)
}

func CreateInvoiceNotificationMessage(
	ctx goContext.Context, senderUri, recipientUri string, invoiceId int, xmlFile, zip []byte,
) (string, error) {
	msgId := uuid.New().String()
	subject := fmt.Sprintf("Faktúra %[1]d / Invoice %[1]d", invoiceId)
	text := fmt.Sprintf(
		msgTemplate,
		fmt.Sprintf("https://dev.einvoice.mfsr.sk/invoices/%d", invoiceId),
	)
	encodedXmlFile := base64.StdEncoding.EncodeToString(xmlFile)
	encodedPdfFile := base64.StdEncoding.EncodeToString(zip)

	msg := &SKTalkMessage{
		EnvelopeVersion: "3.0",
		Header: Header{
			MessageInfo: MessageInfo{
				Class:         "EGOV_NOTIFICATION",
				PospID:        "Doc.GeneralAgenda",
				PospVersion:   "1.2",
				MessageID:     msgId,
				CorrelationID: msgId,
			},
		},
		Body: Body{
			MessageContainer: MessageContainer{
				MessageId:      msgId,
				SenderId:       senderUri,
				RecipientId:    recipientUri,
				MessageType:    "Doc.GeneralAgenda",
				MessageSubject: subject,
				Objects: []Object{
					{
						Id:       uuid.New().String(),
						Class:    "FORM",
						MimeType: "application/x-eform-xml",
						Encoding: "XML",
						GeneralAgenda: &GeneralAgenda{
							Subject: subject,
							Text:    text,
						},
					},
					{
						Id:       uuid.New().String(),
						Name:     getFileName(invoiceId, "xml"),
						Class:    "ATTACHMENT",
						MimeType: "application/xml",
						Encoding: "Base64",
						Value:    &encodedXmlFile,
					},
					{
						Id:       uuid.New().String(),
						Name:     getFileName(invoiceId, "pdf"),
						Class:    "ATTACHMENT",
						MimeType: "application/pdf",
						Encoding: "Base64",
						Value:    &encodedPdfFile,
					},
				},
			},
		},
	}

	bytes, err := xml.Marshal(msg)
	if err != nil {
		context.GetLogger(ctx).
			WithField("invoiceId", invoiceId).
			Error("upvs.sktalk.createNotificationMessage.marshal.failed")

		return "", err
	}

	return string(bytes), nil
}
