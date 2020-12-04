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
