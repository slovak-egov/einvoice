package cache

import (
	goContext "context"
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/go-redis/redis/v8"
	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/apiserver/config"
	"github.com/slovak-egov/einvoice/pkg/context"
)

type Cache struct {
	userTokenExpiration time.Duration
	client *redis.Client
}

func NewRedis(cacheConfig config.CacheConfiguration) *Cache {
	rdb := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%d", cacheConfig.Host, cacheConfig.Port),
		Password: cacheConfig.Password,
		DB:       0,  // use default db
	})

	pong := rdb.Ping(goContext.Background()).Val()
	if pong == "" {
		log.WithField("redisConfig", cacheConfig).Fatal("redis.connection.failed")
	} else {
		log.Info("redis.connection.successful")
	}

	return &Cache{
		userTokenExpiration: cacheConfig.SessionTokenExpiration,
		client: rdb,
	}
}

func userIdKey(token string) string {
	return "token-" + token
}

// TODO: Return error if not successful
func (redis *Cache) SaveUserToken(ctx goContext.Context, token string, id int) {
	redis.client.Set(ctx, userIdKey(token), id, redis.userTokenExpiration).Val()
}

func (redis *Cache) GetUserId(ctx goContext.Context, token string) (int, error) {
	id := redis.client.Get(ctx, userIdKey(token)).Val()
	if id == "" {
		context.GetLogger(ctx).WithField("token", token).Debug("redis.getUser.token.notFound")
		return 0, errors.New("Token not found")
	}
	redis.client.Expire(ctx, userIdKey(token), redis.userTokenExpiration)
	parsedId, err := strconv.Atoi(id)
	if err != nil {
		context.GetLogger(ctx).WithField("id", id).Debug("redis.getUser.parseId.failed")
		return 0, err
	}
	return parsedId, nil
}

func (redis *Cache) RemoveUserToken(ctx goContext.Context, token string) error {
	deletedRecords := redis.client.Del(ctx, userIdKey(token)).Val()
	if deletedRecords == 1 {
		return nil
	} else {
		context.GetLogger(ctx).WithField("token", token).Debug("redis.removeUser.token.notFound")
		return errors.New("Tried to delete non-existent token")
	}
}

func (redis *Cache) FlushAll(ctx goContext.Context) {
	redis.client.FlushAll(ctx)
}
