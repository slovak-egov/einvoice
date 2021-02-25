package main

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"os"

	"github.com/lestrrat-go/libxml2"
	"github.com/lestrrat-go/libxml2/types"

	"github.com/slovak-egov/einvoice/pkg/environment"
)

func getTranslation(translationFilePath string) map[string]string {
	var translations map[string]string
	file, err := os.Open(translationFilePath)
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()
	bytes, err := ioutil.ReadAll(file)
	if err != nil {
		log.Fatal(err)
	}
	err = json.Unmarshal(bytes, &translations)
	if err != nil {
		log.Fatal(err)
	}
	return translations
}

func getSchematronFile(schematronPath string) []byte {
	file, err := os.Open(schematronPath)
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()
	bytes, err := ioutil.ReadAll(file)
	if err != nil {
		log.Fatal(err)
	}
	return bytes
}

type Message struct {
	Sk string `json:"sk"`
	En string `json:"en"`
}

type Rule struct {
	Message Message `json:"message"`
	Context string  `json:"context"`
	Test    string  `json:"test"`
	Flag    string  `json:"flag"`
}

func createRules(schematron []byte, translations map[string]string) map[string]Rule {
	rules := make(map[string]Rule)
	xml, err := libxml2.Parse(schematron)
	if err != nil {
		log.Fatal(err)
	}
	var context string
	err = xml.Walk(func(currentNode types.Node) error {
		element, ok := currentNode.(types.Element)
		if !ok {
			return nil
		}
		switch element.NodeName() {
		case "rule":
			attrs, err := element.Attributes()
			if err != nil {
				return err
			}
			for _, attr := range attrs {
				if attr.NodeName() == "context" {
					context = attr.Value()
				}
			}
		case "assert":
			attrs, err := element.Attributes()
			if err != nil {
				return err
			}
			var id, test, flag, message string
			for _, attr := range attrs {
				switch attr.NodeName() {
				case "id":
					id = attr.Value()
				case "flag":
					flag = attr.Value()
				case "test":
					test = attr.Value()
				}
			}
			if child, err := element.FirstChild(); err != nil {
				return err
			} else {
				message = child.TextContent()
			}

			skMessage, ok := translations[id]
			if !ok {
				skMessage = "TODO: Add translation"
			}
			rules[id] = Rule{
				Message: Message{
					Sk: skMessage,
					En: message,
				},
				Context: context,
				Test:    test,
				Flag:    flag,
			}
		}
		return nil
	})
	if err != nil {
		log.Fatal(err)
	}

	return rules
}

func writeRules(rules map[string]Rule, outputPath string, prettyPrint bool) {
	var bytes []byte
	var err error

	if prettyPrint {
		bytes, err = json.MarshalIndent(rules, "", "  ")
	} else {
		bytes, err = json.Marshal(rules)
	}
	if err != nil {
		log.Fatal(err)
	}
	err = ioutil.WriteFile(outputPath, bytes, 0644)
	if err != nil {
		log.Fatal(err)
	}
}

func main() {
	translationFilePath := environment.Getenv("TRANSLATION_FILE", "sk-rules-translation.json")
	schematronFile := environment.Getenv("SCHEMATRON_FILE", "ubl2.1/schematron/preprocessed/EN16931-UBL-validation-preprocessed.sch")
	outputFile := environment.Getenv("OUTPUT", "ubl2.1/schematron/rules-documentation.json")
	prettyPrint := environment.ParseBool("PRETTY_PRINT", false)

	translations := getTranslation(translationFilePath)

	schematronData := getSchematronFile(schematronFile)

	rules := createRules(schematronData, translations)

	writeRules(rules, outputFile, prettyPrint)
}
