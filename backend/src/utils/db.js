import { AppError } from './AppError.js';

export function unwrap({ data, error }, notFoundMessage) {
  if (error) {
    if (notFoundMessage && (error.code === 'PGRST116' || error.details?.includes('0 rows'))) {
      throw new AppError(404, notFoundMessage);
    }
    if (error.code === '23505') {
      throw new AppError(409, 'That record already exists.');
    }
    if (error.code === '23514') {
      throw new AppError(400, 'That change violates a data constraint.');
    }
    throw new AppError(500, error.message);
  }
  return data;
}
