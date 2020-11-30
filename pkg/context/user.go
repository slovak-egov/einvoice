package context

import "context"

const userIdKey = "userId"

func AddUserId(ctx context.Context, userId int) context.Context {
	return context.WithValue(ctx, userIdKey, userId)
}

func GetUserId(ctx context.Context) int {
	id := ctx.Value(userIdKey)

	if userId, ok := id.(int); ok {
		return userId
	}

	return 0
}
