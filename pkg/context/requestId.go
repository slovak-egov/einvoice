package context

import (
	"context"

	"github.com/google/uuid"
)

const requestIdKey = "requestId"

// Attach a brand new request ID to a http request context
func AddRequestId(ctx context.Context) context.Context {
	id := uuid.New()

	return context.WithValue(ctx, requestIdKey, id.String())
}

// Get reqID from a http request context and return it as a string
func GetRequestId(ctx context.Context) string {
	id := ctx.Value(requestIdKey)

	if requestId, ok := id.(string); ok {
		return requestId
	}

	return ""
}
