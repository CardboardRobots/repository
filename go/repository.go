package repository

import "context"

type Repository[T Valid, Q Query] interface {
	GetById[T]
	GetList[T, Q]
	Create[T]
	Replace[T]
	Update[T]
	Delete
}

type GetById[T Valid] interface {
	GetById(ctx context.Context, id string) (T, error)
}

type Query map[string]interface{}

type Page struct {
	Limit  int
	Offset int
}

type Sort struct {
	Key   string
	Order bool
}

type GetList[T Valid, Q Query] interface {
	GetList(ctx context.Context, query Query, page Page, sort ...Sort) (ListResult[T], error)
}

type Create[T Valid] interface {
	Create(ctx context.Context, data T) (string, error)
}

type Replace[T Valid] interface {
	Replace(ctx context.Context, id string, data T) error
}

type Update[T Valid] interface {
	Update(ctx context.Context, id string, data T) (bool, error)
}

type Delete interface {
	Delete(ctx context.Context, id string) (bool, error)
}
