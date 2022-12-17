package memory

import "github.com/go-playground/validator"

var validate = validator.New()

func StructValidate(data any) error {
	return validate.Struct(data)
}
