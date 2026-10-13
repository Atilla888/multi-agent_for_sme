import { ACTION_SECTIONS, type BuildAction, FILE_NAME, FILE_KEY, TARGET_PAGE } from './constants';

export function assertFile(name: string, key: string | undefined): void {
  if (name !== FILE_NAME) throw new Error(`Wrong file: ${name}. Expected ${FILE_NAME}.`);
  if (key && key !== FILE_KEY) throw new Error(`Wrong Figma file key: ${key}.`);
}

export function ownedNames(action: BuildAction): readonly string[] {
  return ACTION_SECTIONS[action];
}

export function planReplacement(action: BuildAction, topLevelNames: readonly string[]): string[] {
  const owned = ownedNames(action);
  for (const name of owned) {
    if (topLevelNames.filter(n => n === name).length > 1) {
      throw new Error(`Ambiguous duplicate owned section: ${name}. Resolve manually before rebuilding.`);
    }
  }
  return topLevelNames.filter(n => owned.some(section => section === n));
}

export function assertTargetPage(name: string): void {
  if (name !== TARGET_PAGE) throw new Error(`Write blocked: target page must be ${TARGET_PAGE}.`);
}
