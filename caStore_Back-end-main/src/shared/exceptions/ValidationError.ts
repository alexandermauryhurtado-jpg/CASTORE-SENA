import { AppError } from './AppError';

export class ValidationError extends AppError {
  constructor(
    message: string,
    public errors: Record<string, string[]>
  ) {
    super(message, 422, 'VALIDATION_ERROR');
  }
}
