package upvs

import (
	goContext "context"
	"encoding/xml"
	"strconv"
)

type SamlToken struct {
	ActorUPVSIdentityID   string
	SubjectUPVSIdentityID string
	DelegationType        int
}

func (c *Connector) GetSamlToken(ctx goContext.Context, oboToken string) (*SamlToken, error) {
	signedOboToken, err := c.signOboToken(ctx, oboToken)
	if err != nil {
		return nil, err
	}

	response, err := c.sendRequest(
		ctx,
		&request{
			method: "GET",
			url:    "/api/upvs/assertion",
			headers: map[string]string{
				"Authorization": "Bearer " + signedOboToken,
				"Accept":        "application/samlassertion+xml",
			},
		},
	)
	if err != nil {
		return nil, err
	}

	return parseSamlToken(response)
}

type RawSamlToken struct {
	XMLName    xml.Name `xml:"Assertion"`
	Attributes []struct {
		Name           string `xml:",attr"`
		AttributeValue string
	} `xml:"AttributeStatement>Attribute"`
}

func parseSamlToken(data []byte) (*SamlToken, error) {
	raw := &RawSamlToken{}
	err := xml.Unmarshal(data, raw)
	if err != nil {
		return nil, err
	}

	token := &SamlToken{}

	for _, attribute := range raw.Attributes {
		if attribute.Name == "Actor.UPVSIdentityID" {
			token.ActorUPVSIdentityID = attribute.AttributeValue
		}
		if attribute.Name == "Subject.UPVSIdentityID" {
			token.SubjectUPVSIdentityID = attribute.AttributeValue
		}
		if attribute.Name == "DelegationType" {
			token.DelegationType, err = strconv.Atoi(attribute.AttributeValue)
			if err != nil {
				return nil, err
			}
		}
	}

	return token, nil
}
