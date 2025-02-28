export class AppError extends Error {
  public statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode || 500;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Invalid input data') {
    super(message, 400);
  }
}

export const errorHandler = (err, req, res, next) => {
  if (!(err instanceof AppError)) {
    err = new AppError('Internal Server Error', 500);
  }

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
