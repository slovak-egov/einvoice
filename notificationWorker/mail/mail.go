package mail

import (
	goContext "context"
	b64 "encoding/base64"
	"fmt"

	"github.com/mailjet/mailjet-apiv3-go"
	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/notificationWorker/config"
	"github.com/slovak-egov/einvoice/pkg/context"
)

type Sender struct {
	mailjetClient *mailjet.Client
	sender        string
}

func NewSender(mailConfig config.MailConfiguration) *Sender {
	return &Sender{
		mailjet.NewMailjetClient(
			mailConfig.PublicKey, mailConfig.PrivateKey,
		),
		mailConfig.Email,
	}
}

func getMailjetRecipients(emails []string) *mailjet.RecipientsV31 {
	recipientsArray := []mailjet.RecipientV31{}
	for _, email := range emails {
		recipientsArray = append(recipientsArray, mailjet.RecipientV31{Email: email})
	}
	recipients := mailjet.RecipientsV31(recipientsArray)
	return &recipients
}

func (s *Sender) SendInvoice(ctx goContext.Context, invoiceId int, recipients []string, invoice []byte) error {
	messagesInfo := []mailjet.InfoMessagesV31{
		mailjet.InfoMessagesV31{
			From: &mailjet.RecipientV31{
				Email: s.sender,
				Name:  "E-invoice",
			},
			To:       getMailjetRecipients(recipients),
			Subject:  fmt.Sprintf("Invoice %d", invoiceId),
			TextPart: "New invoice was created.",
			Attachments: &mailjet.AttachmentsV31{
				mailjet.AttachmentV31{
					ContentType:   "text/xml",
					Filename:      "invoice.xml",
					Base64Content: b64.StdEncoding.EncodeToString(invoice),
				},
			},
		},
	}
	messages := mailjet.MessagesV31{Info: messagesInfo}
	_, err := s.mailjetClient.SendMailV31(&messages)
	if err != nil {
		context.GetLogger(ctx).WithFields(log.Fields{
			"error": err.Error(),
			"invoiceId": invoiceId,
			"recipients": recipients,
		}).Error("mail.send.failed")
		return err
	}

	return nil
}
