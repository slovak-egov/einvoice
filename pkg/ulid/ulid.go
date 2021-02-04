package ulid

import (
	"crypto/rand"
	"io"
	"time"

	"github.com/google/uuid"
)

var rander = rand.Reader

type Ulid struct {
	timestamp [6]byte
	randomId  [10]byte
}

func unixMiliseconds(t time.Time) uint64 {
	return uint64(t.Unix())*1000 +
		uint64(t.Nanosecond()/int(time.Millisecond))
}

func newTimePart(t time.Time) [6]byte {
	timestamp := unixMiliseconds(t)

	return [6]byte{
		byte(timestamp >> 40), byte(timestamp >> 32), byte(timestamp >> 24), byte(timestamp >> 16),
		byte(timestamp >> 8), byte(timestamp),
	}
}

func New(t time.Time) Ulid {
	id := Ulid{
		timestamp: newTimePart(t),
	}

	_, err := io.ReadFull(rander, id.randomId[:])
	if err != nil {
		panic(err)
	}
	return id
}

func NewFirst(t time.Time) Ulid {
	return Ulid{
		timestamp: newTimePart(t),
	}
}

func NewLast(t time.Time) Ulid {
	// Create the largest possible randomId
	randomId := [10]byte{}
	for i := range randomId {
		randomId[i] = 0xff
	}
	return Ulid{
		timestamp: newTimePart(t),
		randomId: randomId,
	}
}

func Parse(id string) (u Ulid, err error) {
	parsedId, err := uuid.Parse(id)
	if err != nil {
		return u, err
	}
	copy(u.timestamp[:], parsedId[:6])
	copy(u.randomId[:], parsedId[6:])
	return
}

func (id Ulid) String() string {
	parsedUuid, err := uuid.FromBytes(append(id.timestamp[:], id.randomId[:]...))
	if err != nil {
		panic(err)
	}
	return parsedUuid.String()
}

func (id Ulid) Time() time.Time {
	milliseconds := uint64(id.timestamp[5]) | uint64(id.timestamp[4])<<8 |
		uint64(id.timestamp[3])<<16 | uint64(id.timestamp[2])<<24 |
		uint64(id.timestamp[1])<<32 | uint64(id.timestamp[0])<<40

	s := int64(milliseconds / 1e3)
	ns := int64((milliseconds % 1e3) * 1e6)
	return time.Unix(s, ns)
}
