package memory

import (
	"context"
	"fmt"

	"github.com/cardboardrobots/repository"
)

type Collection[T any] struct {
	Items             map[string]T
	currentId         int
	preInsertCallback func(value T, id string)
}

func NewCollection[T any](preInsertCallback func(value T, id string)) *Collection[T] {
	return &Collection[T]{
		Items:             map[string]T{},
		preInsertCallback: preInsertCallback,
	}
}

var _ repository.Repository[bool] = &Collection[bool]{}

func (c *Collection[T]) GetList(ctx context.Context, query repository.Query) (*repository.ListResult[T], error) {
	count, _ := c.Count(ctx)
	result := repository.NewListResult(count, c.Slice())
	return &result, nil
}

func (c *Collection[T]) Count(ctx context.Context) (int, error) {
	return len(c.Items), nil
}

func (c *Collection[T]) Slice() []T {
	data := make([]T, len(c.Items))
	i := 0
	for _, value := range c.Items {
		data[i] = value
		i++
	}
	return data
}

func (c *Collection[T]) GetById(ctx context.Context, id string) (T, error) {
	value, ok := c.Items[id]
	if !ok {
		var zero T
		return zero, repository.NewErrNotFound()
	}

	return value, nil
}

func (c *Collection[T]) Create(ctx context.Context, value T) (string, error) {
	id := fmt.Sprintf("%v", c.currentId)
	c.currentId = c.currentId + 1
	c.preInsertCallback(value, id)
	c.Items[id] = value
	return id, nil
}

func (c *Collection[T]) Update(ctx context.Context, id string, value T) (bool, error) {
	_, ok := c.Items[id]
	if !ok {
		return false, repository.NewErrNotFound()
	}

	c.Items[id] = value
	return true, nil
}

func (c *Collection[T]) Delete(ctx context.Context, id string) (bool, error) {
	_, ok := c.Items[id]
	if !ok {
		return false, repository.NewErrNotFound()
	}

	delete(c.Items, id)
	return true, nil
}
