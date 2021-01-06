package cache

import (
	goContext "context"
	"fmt"
	"time"

	"github.com/go-redis/redis/v8"
	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/apiserver/config"
	"github.com/slovak-egov/einvoice/pkg/context"
)

type Cache struct {
	userTokenExpiration              time.Duration
	client                           *redis.Client
	testInvoiceRateLimiterExpiration time.Duration
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
		userTokenExpiration:              cacheConfig.SessionTokenExpiration,
		client:                           rdb,
		testInvoiceRateLimiterExpiration: cacheConfig.TestInvoiceRateLimiterExpiration,
	}
}

func userIdKey(token string) string {
	return fmt.Sprintf("token:%s", token)
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
		return 0, &TokenNotFoundError{token}
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
		return &TokenNotFoundError{token}
	}

	return nil
}

func jtiKey(userId int, jti string) string {
	return fmt.Sprintf("userId:%d:jti:%s", userId, jti)
}

func (r *Cache) SaveJti(ctx goContext.Context, userId int, jti string, expiration time.Duration) error {
	v, err := r.client.SetNX(ctx, jtiKey(userId, jti), "", expiration).Result()
	if err != nil {
		return err
	}
	if !v {
		return &JtiExistsError{jti}
	}
	return nil
}

func (r *Cache) FlushAll(ctx goContext.Context) error {
	return r.client.FlushAll(ctx).Err()
}

func testInvoiceRateLimiterKey(userId int) string {
	return fmt.Sprintf("test:invoices:userId:%d", userId)
}

/*
Increments test invoice counter for user and returns it's new value.
If counter doesn't exist new counter is created with value 1 and expiration 24 hours.
*/
func (r *Cache) IncrementTestInvoiceCounter(ctx goContext.Context, userId int) (int, error) {
	key := testInvoiceRateLimiterKey(userId)
	var counter int64

	err := r.client.Watch(ctx, func(tx *redis.Tx) error {
		var err error
		counter, err = tx.Incr(ctx, key).Result()
		if err != nil {
			return err
		}
		if counter == 1 {
			if _, err = tx.Expire(ctx, key, r.testInvoiceRateLimiterExpiration).Result(); err != nil {
				return err
			}
		}
		return nil
	})

	if err != nil {
		return 0, err
	}

	return int(counter), nil
}
