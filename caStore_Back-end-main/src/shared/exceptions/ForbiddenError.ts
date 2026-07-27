import { AppError } from './AppError';

export class ForbiddenError extends AppError {
  constructor(message = 'No tienes permisos para esta acción') {
    super(message, 403, 'FORBIDDEN');
  }
}
