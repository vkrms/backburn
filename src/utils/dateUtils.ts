import { isToday as dateFnsIsToday } from 'date-fns';

/**
 * Check if a given date is today
 * @param date - The date to check
 * @returns true if the date is today, false otherwise
 */
export const isToday = (date: Date): boolean => {
  return dateFnsIsToday(date);
};
