import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Location } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate a simple session ID for tracking
export function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Validate postcode uformat (Australian postcodes are 4 digits)
export function validatePostcode(postcode: string): boolean {
  return /^\d{4}$/.test(postcode);
}

// Normalize suburb name for comparison
export function normalizeSuburb(suburb: string): string {
  return suburb.trim().toLowerCase().replace(/\s+/g, ' ');
}

// Check if a postcode matches a suburb based on API results
export function validatePostcodeSuburbMatch(
  postcode: string,
  suburb: string,
  locations: Location[]
): boolean {
  const normalizedSuburb = normalizeSuburb(suburb);

  return locations.some(
    (location) =>
      location.postcode === postcode &&
      normalizeSuburb(location.location) === normalizedSuburb
  );
}

// Check if a suburb exists in a state
export function validateSuburbStateMatch(
  suburb: string,
  state: string,
  locations: Location[]
): boolean {
  const normalizedSuburb = normalizeSuburb(suburb);

  return locations.some(
    (location) =>
      normalizeSuburb(location.location) === normalizedSuburb &&
      location.state === state
  );
}

// Get unique categories from locations
export function getUniqueCategories(locations: Location[]): string[] {
  const categories = new Set(locations.map((loc) => loc.category));
  return Array.from(categories).sort();
}

// Filter locations by categories
export function filterLocationsByCategories(
  locations: Location[],
  selectedCategories: string[]
): Location[] {
  if (selectedCategories.length === 0) return locations;
  return locations.filter((loc) => selectedCategories.includes(loc.category));
}

// Format error messages for validation
export function formatValidationError(
  type: 'postcode-suburb' | 'suburb-state',
  postcode?: string,
  suburb?: string,
  state?: string
): string {
  switch (type) {
    case 'postcode-suburb':
      return `The postcode ${postcode} does not match the suburb ${suburb}`;
    case 'suburb-state':
      return `The suburb ${suburb} does not exist in the state ${state}`;
    default:
      return 'Validation error occurred';
  }
}
