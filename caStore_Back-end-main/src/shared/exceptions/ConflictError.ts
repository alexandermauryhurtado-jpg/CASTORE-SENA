import { AppError } from './AppError';

export class ConflictError extends AppError {
  constructor(field: string) {
    super(`Ya existe un registro con ese ${field}`, 409, 'CONFLICT');
  }
}
