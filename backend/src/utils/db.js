import { AppError } from './AppError.js';

// Supabase-js returns { data, error } instead of throwing. This turns the
// error branch into a thrown AppError so it flows through the single
// centralized error handler (via express-async-errors) instead of every
// route re-implementing the same if (error) { res.status... } check.
export function unwrap({ data, error }, notFoundMessage) {
  if (error) {
    if (notFoundMessage && (error.code === 'PGRST116' || error.details?.includes('0 rows'))) {
      throw new AppError(404, notFoundMessage);
    }
    if (error.code === '23505') {
      throw new AppError(409, 'That record already exists.');
    }
    throw new AppError(500, error.message);
  }
  return data;
}
