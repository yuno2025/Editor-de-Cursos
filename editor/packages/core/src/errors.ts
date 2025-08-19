export class EditorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EditorError";
  }
}

export class ValidationError extends EditorError {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends EditorError {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class InvariantError extends EditorError {
  constructor(message: string) {
    super(message);
    this.name = "InvariantError";
  }
}
