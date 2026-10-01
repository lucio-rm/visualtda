/**
 * Title and Heading Typography Normalizer
 * Ensures strict, consistent typography and spacing around separators
 * (em-dashes, en-dashes, colons, hyphens, middle dots, parentheses)
 * across Visual TDA exercise titles, breadcrumbs, track headers, and markdown headings.
 */

export function formatTitleSpacing(title: string): string {
  if (!title) return '';

  return title
    // Collapse multiple horizontal whitespaces
    .replace(/[ \t]+/g, ' ')
    // Ensure no space before colon, exactly one space after colon
    .replace(/\s*:\s*/g, ': ')
    // Ensure consistent single space around em-dashes (—) and en-dashes (–) used as separators
    .replace(/\s*([—–])\s*/g, ' $1 ')
    // Ensure consistent single space around middle dots (·)
    .replace(/\s*·\s*/g, ' · ')
    // Ensure consistent spacing around standalone hyphens with space
    .replace(/\s+-\s+/g, ' - ')
    // Ensure space before opening parenthesis if preceded by a regular word (excluding single letter notations like O(n) or p(j))
    .replace(/([a-zA-Z]{2,})\(/g, '$1 (')
    // Ensure no redundant whitespace right inside parentheses
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .trim();
}
