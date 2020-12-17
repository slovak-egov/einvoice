package cache

import (
	goContext "context"
	"fmt"
	"strconv"
	"time"

	"github.com/go-redis/redis/v8"
	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/apiserver/config"
	"github.com/slovak-egov/einvoice/pkg/context"
	"github.com/slovak-egov/einvoice/pkg/handlerutil"
)

type Cache struct {
	userTokenExpiration time.Duration
	client              *redis.Client
}

func NewRedis(cacheConfig config.CacheConfiguration) *Cache {
	rdb := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%d", cacheConfig.Host, cacheConfig.Port),
		Password: cacheConfig.Password,
		DB:       0, // use default db
	})

	err := rdb.Ping(goContext.Background()).Err()
	if err != nil {
		log.WithFields(log.Fields{
			"redisConfig": cacheConfig,
			"error":       err,
		}).Fatal("redis.connection.failed")
	} else {
		log.Info("redis.connection.successful")
	}

	return &Cache{
		userTokenExpiration: cacheConfig.SessionTokenExpiration,
		client:              rdb,
	}
}

func userIdKey(token string) string {
	return "token-" + token
}

func (r *Cache) SaveUserToken(ctx goContext.Context, token string, userId int) error {
	err := r.client.Set(ctx, userIdKey(token), userId, r.userTokenExpiration).Err()
	if err != nil {
		context.GetLogger(ctx).WithFields(log.Fields{
			"token":  token,
			"userId": userId,
		}).Error("redis.saveUserToken.failed")
		return err
	}
	return nil
}

func (r *Cache) GetUserId(ctx goContext.Context, token string) (int, error) {
	id, err := r.client.Get(ctx, userIdKey(token)).Int()
	if err == redis.Nil {
		context.GetLogger(ctx).WithField("token", token).Debug("redis.getUserId.token.notFound")
		return 0, handlerutil.NewNotFoundError("Token not found")
	} else if err != nil {
		context.GetLogger(ctx).WithField("token", token).Error("redis.getUserId.failed")
		return 0, err
	}

	err = r.client.Expire(ctx, userIdKey(token), r.userTokenExpiration).Err()
	if err != nil {
		context.GetLogger(ctx).WithField("token", token).Error("redis.getUserId.prolongExpiration.failed")
		return 0, err
	}

	return id, nil
}

func (r *Cache) RemoveUserToken(ctx goContext.Context, token string) error {
	res, err := r.client.Del(ctx, userIdKey(token)).Result()
	if err != nil {
		context.GetLogger(ctx).WithField("token", token).Error("redis.removeUserToken.failed")
		return err
	} else if res != 1 {
		context.GetLogger(ctx).WithField("token", token).Debug("redis.removeUserToken.notFound")
		return handlerutil.NewNotFoundError("Token not found")
	}

	return nil
}

func jtiKey(userId int, jti string) string {
	return fmt.Sprintf("jti-%v-%v", strconv.Itoa(userId), jti)
}

func (r *Cache) ContainsJti(ctx goContext.Context, userId int, jti string) (bool, error) {
	_, err := r.client.Get(ctx, jtiKey(userId, jti)).Result()
	if err == redis.Nil {
		return false, nil
	} else if err != nil {
		return false, err
	}
	return true, nil
}

func (r *Cache) AddJti(ctx goContext.Context, userId int, jti string, expiration time.Duration) error {
	_, err := r.client.Set(ctx, jtiKey(userId, jti), "", expiration).Result()
	return err
}

func (r *Cache) FlushAll(ctx goContext.Context) error {
	return r.client.FlushAll(ctx).Err()
}
