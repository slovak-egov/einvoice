package apiserver

import (
	"strconv"
	"time"

	"github.com/slovak-egov/einvoice/pkg/timeutil"
)

func getOptionalInt(value string, defaultValue int) (int, error) {
	// Return default int if value is not provided
	if value == "" {
		return defaultValue, nil
	}
	parsedValue, err := strconv.Atoi(value)
	if err != nil {
		return 0, err
	}
	return parsedValue, nil
}

func getOptionalFloat(value string) (*float64, error) {
	// Return nil if value is not provided
	if value == "" {
		return nil, nil
	}
	parsedValue, err := strconv.ParseFloat(value, 64)
	if err != nil {
		return nil, err
	}
	return &parsedValue, nil
}

func getOptionalBool(value string, defaultValue bool) (bool, error) {
	// Return default if value is not provided
	if value == "" {
		return defaultValue, nil
	}
	parsedValue, err := strconv.ParseBool(value)
	if err != nil {
		return false, err
	}
	return parsedValue, nil
}

func getOptionalDate(value string) (*timeutil.Date, error) {
	if value == "" {
		return nil, nil
	}
	date, err := timeutil.ParseDate(value, timeutil.DateLayoutISO)
	if err != nil {
		return nil, err
	}
	return date, nil
}

func getOptionalTime(value string) (*time.Time, error) {
	if value == "" {
		return nil, nil
	}
	t, err := time.Parse(timeutil.DateTimeLayoutISO, value)
	if err != nil {
		return nil, err
	}
	return &t, nil
}
