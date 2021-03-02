package apiserver

import (
	"errors"
	"strconv"
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

func getEnum(value string, possibleValues []string, defaultValue string) (string, error) {
	// Return default if value is not provided
	if value == "" {
		// If defaultValue is not defined return error
		if defaultValue == "" {
			return "", errors.New("missing")
		} else {
			return defaultValue, nil
		}
	}

	for _, possibleValue := range possibleValues {
		if value == possibleValue {
			return value, nil
		}
	}

	// Value is not in enum
	return "", errors.New("unknown")
}
