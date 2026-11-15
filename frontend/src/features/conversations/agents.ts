/** True for the AI specialists (Sales, Support, Analytics), which are shown with a neutral agent avatar. */
export function isAgent(name: string): boolean {
  return /^(Sales|Support|Analytics)\b/.test(name);
}
