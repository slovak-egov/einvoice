package cache

import (
	goContext "context"
	"fmt"
	"time"

	"github.com/go-redis/redis/v8"
	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/pkg/context"
)

type Cache struct {
	client                           *redis.Client
	userTokenExpiration              time.Duration
	testInvoiceRateLimiterExpiration time.Duration
	draftExpiration                  time.Duration
}

func NewRedis(cacheConfig Configuration) *Cache {
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
		client:                           rdb,
		userTokenExpiration:              cacheConfig.SessionTokenExpiration,
		testInvoiceRateLimiterExpiration: cacheConfig.TestInvoiceRateLimiterExpiration,
		draftExpiration:                  cacheConfig.DraftExpiration,
	}
}

func userIdKey(token string) string {
	return fmt.Sprintf("sessionToken:%s", token)
}

func (r *Cache) SaveUserToken(ctx goContext.Context, token string, userId int) error {
	err := r.client.Set(ctx, userIdKey(token), userId, r.userTokenExpiration).Err()
	if err != nil {
		context.GetLogger(ctx).WithFields(log.Fields{
			"sessionToken": token,
			"userId": userId,
			"error": err,
		}).Error("redis.saveUserToken.failed")
		return err
	}
	return nil
}

func (r *Cache) GetUserId(ctx goContext.Context, token string) (int, error) {
	id, err := r.client.Get(ctx, userIdKey(token)).Int()
	if err == redis.Nil {
		context.GetLogger(ctx).WithField("token", token).Debug("redis.getUserId.token.notFound")
		return 0, &NotFoundError{"Token", token}
	} else if err != nil {
		context.GetLogger(ctx).WithField("token", token).Error("redis.getUserId.failed")
		return 0, err
	}

	err = r.client.Expire(ctx, userIdKey(token), r.userTokenExpiration).Err()
	if err != nil {
		context.GetLogger(ctx).WithFields(log.Fields{
			"token": token,
			"error": err,
		}).Error("redis.getUserId.prolongExpiration.failed")
		return 0, err
	}

	return id, nil
}

func (r *Cache) RemoveUserToken(ctx goContext.Context, token string) error {
	res, err := r.client.Del(ctx, userIdKey(token)).Result()
	if err != nil {
		context.GetLogger(ctx).WithFields(log.Fields{
			"token": token,
			"error": err,
		}).Error("redis.removeUserToken.failed")
		return err
	} else if res != 1 {
		context.GetLogger(ctx).WithField("token", token).Debug("redis.removeUserToken.notFound")
		return &NotFoundError{"Token", token}
	}

	return nil
}

func jtiKey(userId int, jti string) string {
	return fmt.Sprintf("user:%d:jti:%s", userId, jti)
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
	return fmt.Sprintf("testInvoices:user:%d", userId)
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

func draftsKey(userId int) string {
	return fmt.Sprintf("user:%d:drafts", userId)
}

func (r *Cache) SaveDraft(ctx goContext.Context, draftId, name string) error {
	err := r.client.HSet(ctx, draftsKey(context.GetUserId(ctx)), draftId, name).Err()
	if err != nil {
		context.GetLogger(ctx).WithFields(log.Fields{
			"draftId": draftId,
			"userId": context.GetUserId(ctx),
			"error": err,
		}).Error("redis.saveDraft.failed")
		return err
	}
	return nil
}

func (r *Cache) DeleteDraft(ctx goContext.Context, draftId string) error {
	res, err := r.client.HDel(ctx, draftsKey(context.GetUserId(ctx)), draftId).Result()
	if err != nil {
		context.GetLogger(ctx).WithFields(log.Fields{
			"draftId": draftId,
			"userId": context.GetUserId(ctx),
			"error": err,
		}).Error("redis.deleteDraft.failed")
		return err
	} else if res != 1 {
		context.GetLogger(ctx).WithField("draftId", draftId).Debug("redis.deleteDraft.notFound")
		return &NotFoundError{"Draft", draftId}
	}

	return nil
}

func (r *Cache) GetDrafts(ctx goContext.Context) (map[string]string, error) {
	ids, err := r.client.HGetAll(ctx, draftsKey(context.GetUserId(ctx))).Result()
	if err != nil {
		context.GetLogger(ctx).WithField("userId", context.GetUserId(ctx)).Error("redis.getDrafts.failed")
		return nil, err
	}


	return ids, nil
}
