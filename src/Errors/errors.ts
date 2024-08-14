export class BadRequest extends Error {
  code: number;
  constructor(message: string, code = 400) {
    super(message); // (1)
    this.name = "Bad request"; // (2)
    this.message = message;
    this.code = code;
  }
}

export class InternalServerError extends Error {
  code: number;
  constructor(message: string, code = 500) {
    super(message); // (1)
    this.name = "Internal server error"; // (2)
    this.code = code;
  }
}
export class NotfoundError extends Error {
  code: number;
  constructor(message: string) {
    super(message); // (1)
    this.name = "Not found"; // (2)
    this.code = 404;
  }
}
