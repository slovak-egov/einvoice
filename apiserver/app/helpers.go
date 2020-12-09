package app

import "strconv"

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
