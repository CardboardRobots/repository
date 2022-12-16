export class PersistenceError extends Error {
  name = this.constructor.name;
  base = "PersistenceError";

  constructor(message?: string) {
    super(message);
  }

  toString(): string {
    if (this.message === this.base) {
      return this.message;
    } else {
      return `${this.base}: ${this.message}`;
    }
  }
}

export class NotFoundError extends PersistenceError {
  base = NOT_FOUND;
  constructor(message = NOT_FOUND) {
    super(message);
  }
}

const NOT_FOUND = "Not Found";
