import { AppError } from './AppError';

export class BusinessError extends AppError {
  constructor(message: string) {
    super(message, 409, 'BUSINESS_ERROR');
  }
}
