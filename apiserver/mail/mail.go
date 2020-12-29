package mail

import (
	goContext "context"
	b64 "encoding/base64"

	"github.com/mailjet/mailjet-apiv3-go"

	"github.com/slovak-egov/einvoice/apiserver/config"
	"github.com/slovak-egov/einvoice/pkg/context"
)

type Sender struct {
	mailjetClient *mailjet.Client
	sender        string
}

func NewSender(mailConfig config.MailConfiguration) *Sender {
	// If mail server is not configured, do not send any mails
	if mailConfig.PrivateKey == "" {
		return nil
	}
	return &Sender{
		mailjet.NewMailjetClient(
			mailConfig.PublicKey, mailConfig.PrivateKey,
		),
		mailConfig.Email,
	}
}

func getMailjetRecipients(receiverEmails []string) *mailjet.RecipientsV31 {
	recipientsArray := []mailjet.RecipientV31{}
	for _, email := range receiverEmails {
		recipientsArray = append(recipientsArray, mailjet.RecipientV31{Email: email})
	}
	recipients := mailjet.RecipientsV31(recipientsArray)
	return &recipients
}

func (s *Sender) SendInvoice(ctx goContext.Context, receiverEmails []string, invoice []byte) {
	messagesInfo := []mailjet.InfoMessagesV31{
		mailjet.InfoMessagesV31{
			From: &mailjet.RecipientV31{
				Email: s.sender,
				Name:  "E-invoice",
			},
			To:       getMailjetRecipients(receiverEmails),
			Subject:  "Invoice",
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
		context.GetLogger(ctx).WithField("error", err.Error()).Warn("mail.send.failed")
	}
}
