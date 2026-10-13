export interface AvatarProps {
  readonly accessibleName: string;
  readonly initials: string;
  readonly label?: string;
}

export function Avatar({ accessibleName, initials, label }: AvatarProps) {
  return (
    <span className="avatar-with-label">
      <span className="avatar" role="img" aria-label={accessibleName}>{initials}</span>
      {label ? <span className="avatar__label">{label}</span> : null}
    </span>
  );
}
