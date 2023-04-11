package memory

import (
	"context"
	"sort"

	repository "github.com/cardboardrobots/repository/go"
)

type MemoryRepository[T any, Q repository.Query] struct {
	Items             map[string]T
	preInsertCallback func(value T, id string)
	compare           func(a T, b T, sort ...repository.Sort) bool
}

func NewMemoryRepository[T any, Q repository.Query](preInsertCallback func(value T, id string), compare func(a T, b T, sort ...repository.Sort) bool) *MemoryRepository[T, Q] {
	return &MemoryRepository[T, Q]{
		Items:             map[string]T{},
		preInsertCallback: preInsertCallback,
		compare:           compare,
	}
}

var _ repository.Repository[repository.Valid, repository.Query] = &MemoryRepository[repository.Valid, repository.Query]{}

func (c *MemoryRepository[T, Q]) GetList(ctx context.Context, query Q, page repository.Page, _sort ...repository.Sort) (repository.ListResult[T], error) {
	limit := page.Limit
	if limit == 0 {
		limit = 10
	}
	count, _ := c.Count(ctx)
	data := c.Slice()
	sort.Slice(data, func(i, j int) bool {
		a := data[i]
		b := data[j]
		return c.compare(a, b, _sort...)
	})
	data = data[page.Offset : limit-page.Offset]
	result := repository.NewListResult(count, data)
	return result, nil
}

func (c *MemoryRepository[T, Q]) Count(ctx context.Context) (int, error) {
	return len(c.Items), nil
}

func (c *MemoryRepository[T, Q]) Slice() []T {
	data := make([]T, len(c.Items))
	i := 0
	for _, value := range c.Items {
		data[i] = value
		i++
	}
	return data
}

func (c *MemoryRepository[T, Q]) GetById(ctx context.Context, id string) (T, error) {
	value, ok := c.Items[id]
	if !ok {
		var zero T
		return zero, repository.NewErrNotFound()
	}

	return value, nil
}

func (c *MemoryRepository[T, Q]) Create(ctx context.Context, value T) (string, error) {
	id := Uuid()
	c.preInsertCallback(value, id)
	c.Items[id] = value
	return id, nil
}

func (c *MemoryRepository[T, Q]) Replace(ctx context.Context, id string, value T) error {
	c.Items[id] = value
	return nil
}

func (c *MemoryRepository[T, Q]) Update(ctx context.Context, id string, value T) (bool, error) {
	_, ok := c.Items[id]
	if !ok {
		return false, repository.NewErrNotFound()
	}

	c.Items[id] = value
	return true, nil
}

func (c *MemoryRepository[T, Q]) Delete(ctx context.Context, id string) (bool, error) {
	_, ok := c.Items[id]
	if !ok {
		return false, repository.NewErrNotFound()
	}

	delete(c.Items, id)
	return true, nil
}
