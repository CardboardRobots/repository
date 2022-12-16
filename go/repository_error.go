package repository

type RepositoryError struct {
	Message string
}

func NewRepositoryError(message string) RepositoryError {
	return RepositoryError{
		message,
	}
}

func (err RepositoryError) Error() string {
	return err.Message
}

func NewErrNotFound() RepositoryError {
	return RepositoryError{
		Message: NOT_FOUND,
	}
}

const NOT_FOUND = "not found"
