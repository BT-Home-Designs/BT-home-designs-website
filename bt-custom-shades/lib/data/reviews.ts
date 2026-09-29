/**
 * Real, verified customer reviews only. This file intentionally starts
 * empty — do not fill it with illustrative or invented quotes. The
 * Testimonials component (components/Testimonials.tsx) hides its section
 * entirely whenever this array is empty, rather than fabricating reviews
 * to fill the space.
 *
 * To publish real reviews: add objects here once you have permission
 * from the customer to display their name/quote publicly.
 */

export type Review = {
  quote: string;
  name: string;
  location: string;
  rating: 1 | 2 | 3 | 4 | 5;
};

export const reviews: Review[] = [];
