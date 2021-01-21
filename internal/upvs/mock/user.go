package upvsMock

import (
	"net/http"
	"strings"

	"github.com/dgrijalva/jwt-go"

	"github.com/slovak-egov/einvoice/pkg/handlerutil"
)

var users = map[string]string{
	"rc://sk/8314451298_tisici_janko": "{\"ids\":[{\"type\":\"sector_upvs\",\"value\":\"2de0c756-63ea-4b4e-9b38-955453a6a580\"}],\"uri\":\"rc://sk/8314451298_tisici_janko\",\"en\":\"E0000046137\",\"type\":\"natural_person\",\"status\":\"activated\",\"name\":\"Janko Tisíci\",\"suffix\":null,\"various_ids\":[],\"upvs\":{\"edesk_number\":\"E0000046137\",\"edesk_status\":\"deliverable\",\"edesk_remote_uri\":null,\"edesk_cuet_delivery_enabled\":false,\"edesk_delivery_limited\":false,\"enotify_preferred_channel\":null,\"enotify_preferred_calendar\":null,\"enotify_emergency_allowed\":null,\"enotify_email_allowed\":null,\"enotify_sms_allowed\":null,\"preferred_language\":null,\"re_iam_identity_id\":null},\"natural_person\":{\"type\":{\"id\":\"1\",\"name\":\"Občan SR s trvalým pobytom na území SR\",\"description\":null},\"name\":\"Janko Tisíci\",\"given_names\":[\"Janko\"],\"preferred_given_name\":null,\"given_family_names\":[],\"family_names\":[{\"primary\":null,\"prefix\":null,\"value\":\"Tisíci\"}],\"legal_name\":null,\"other_name\":null,\"prefixes\":[],\"suffixes\":[],\"alternative_names\":[],\"gender\":null,\"marital_status\":\"nezistené\",\"vital_status\":null,\"nationality\":{\"id\":\"0\",\"name\":\"703\",\"description\":null},\"occupation\":null,\"birth\":{\"date\":\"1983-11-24\",\"country\":null,\"district\":null,\"municipality\":{\"id\":\"SK0104529389\",\"name\":\"Bratislava - mestská časť Dúbravka\",\"description\":null},\"part\":null},\"death\":null,\"updated_on\":null},\"addresses\":[{\"type\":\"resident\",\"inline\":null,\"country\":{\"id\":\"703\",\"name\":\"Slovenská republika\",\"description\":null},\"region\":null,\"district\":{\"id\":\"SK0104\",\"name\":\"Okres Bratislava IV\",\"description\":null},\"municipality\":{\"id\":\"SK0104529389\",\"name\":\"Bratislava - mestská časť Dúbravka\",\"description\":null},\"part\":null,\"street\":\"Saratovská\",\"building_number\":\"1\",\"registration_number\":1111,\"unit\":null,\"building_index\":null,\"delivery_address\":{\"postal_code\":\"84102\",\"post_office_box\":null,\"recipient\":null},\"ra_entry\":null,\"specified\":true}],\"emails\":[],\"phones\":[]}",
	"ico://sk/11190993":               "{\"ids\":[{\"type\":\"sector_upvs\",\"value\":\"1c4d51e4-0061-4dfb-a8d8-463f24d89940\"}],\"uri\":\"ico://sk/11190993\",\"en\":\"E0000079788\",\"type\":\"legal_entity\",\"status\":\"activated\",\"name\":\"PO 190993\",\"suffix\":null,\"various_ids\":[{\"type\":{\"id\":\"7\",\"name\":\"IČO (Identifikačné číslo organizácie)\",\"description\":null},\"value\":\"11190993\",\"specified\":true}],\"upvs\":{\"edesk_number\":\"E0000079788\",\"edesk_status\":\"deliverable\",\"edesk_remote_uri\":null,\"edesk_cuet_delivery_enabled\":false,\"edesk_delivery_limited\":false,\"enotify_preferred_channel\":null,\"enotify_preferred_calendar\":null,\"enotify_emergency_allowed\":null,\"enotify_email_allowed\":null,\"enotify_sms_allowed\":null,\"preferred_language\":null,\"re_iam_identity_id\":\"252072\"},\"corporate_body\":{\"cin\":\"11190993\",\"tin\":null,\"organization_id\":null,\"organization_units\":[],\"name\":\"PO 190993\",\"alternative_names\":[],\"legal_form\":{\"id\":\"995\",\"name\":\"Nešpecifikovaná právna forma\",\"description\":null},\"legal_facts\":[],\"activities\":[],\"established_on\":\"2013-01-01\",\"terminated_on\":null,\"updated_on\":null},\"addresses\":[{\"type\":\"resident\",\"inline\":null,\"country\":{\"id\":\"703\",\"name\":\"Slovenská republika\",\"description\":null},\"region\":null,\"district\":{\"id\":\"SK0104\",\"name\":\"Okres Bratislava IV\",\"description\":null},\"municipality\":{\"id\":\"SK0104529389\",\"name\":\"Bratislava - mestská časť Dúbravka\",\"description\":null},\"part\":null,\"street\":\"Saratovská\",\"building_number\":\"1\",\"registration_number\":1111,\"unit\":null,\"building_index\":null,\"delivery_address\":{\"postal_code\":\"84102\",\"post_office_box\":null,\"recipient\":null},\"ra_entry\":null,\"specified\":true}],\"emails\":[],\"phones\":[]}",
}

func (a *App) handleUserInfo(res http.ResponseWriter, req *http.Request) error {
	header := req.Header.Get("Authorization")
	parts := strings.Split(header, " ")

	if header == "" || len(parts) != 2 {
		return handlerutil.NewAuthorizationError("unauthorized")
	}
	apiTokenString := parts[1]

	apiToken, err := jwt.Parse(apiTokenString, func(token *jwt.Token) (interface{}, error) {
		return a.ApiTokenPublic, nil
	})

	if err != nil {
		return handlerutil.NewAuthorizationError("apiToken.parseToken.failed")
	}

	if !apiToken.Valid {
		return handlerutil.NewAuthorizationError("apiToken.invalid")
	}

	ApiClaims, ok := apiToken.Claims.(jwt.MapClaims)
	if !ok {
		return handlerutil.NewAuthorizationError("apiToken.claims.invalid")
	}

	oboTokenString, ok := ApiClaims["obo"].(string)
	if !ok {
		return handlerutil.NewAuthorizationError("apiToken.claims.obo.missing")
	}

	oboToken, err := jwt.Parse(oboTokenString, func(token *jwt.Token) (interface{}, error) {
		return a.OboTokenPublic, nil
	})

	if err != nil {
		return handlerutil.NewAuthorizationError("oboToken.parseToken.failed")
	}

	if !oboToken.Valid {
		return handlerutil.NewAuthorizationError("oboToken.invalid")
	}

	oboClaims, ok := oboToken.Claims.(jwt.MapClaims)
	if !ok {
		return handlerutil.NewAuthorizationError("oboToken.claims.invalid")
	}

	sub := oboClaims["sub"].(string)
	userInfo, ok := users[sub]
	if !ok {
		return handlerutil.NewAuthorizationError("user.unknown")
	}

	_, err = res.Write([]byte(userInfo))
	return err
}
