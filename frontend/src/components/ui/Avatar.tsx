export type AvatarHue = 0 | 1 | 2 | 3 | 4 | 5;

export interface AvatarProps {
  readonly accessibleName: string;
  readonly initials: string;
  readonly label?: string;
  /** People get initials on a muted colour; AI agents get a neutral mark (agents are never colour-coded). */
  readonly variant?: "person" | "agent";
}

/** A stable muted colour slot for a person, picked from their name. */
export function avatarHue(name: string): AvatarHue {
  let sum = 0;
  for (const character of name) sum += character.codePointAt(0) ?? 0;
  return (sum % 6) as AvatarHue;
}

export function Avatar({ accessibleName, initials, label, variant = "person" }: AvatarProps) {
  const avatar = variant === "agent"
    ? (
      <span className="avatar avatar--agent" role="img" aria-label={accessibleName}>
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false"><path d="M8 1.5 9.6 6.4 14.5 8 9.6 9.6 8 14.5 6.4 9.6 1.5 8 6.4 6.4Z" /></svg>
      </span>
    )
    : <span className={`avatar avatar--hue-${avatarHue(accessibleName)}`} role="img" aria-label={accessibleName}>{initials}</span>;
  return (
    <span className="avatar-with-label">
      {avatar}
      {label ? <span className="avatar__label">{label}</span> : null}
    </span>
  );
}
