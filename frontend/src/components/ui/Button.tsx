import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly loading?: boolean;
  readonly loadingLabel?: string;
  readonly leadingIcon?: ReactNode;
  readonly trailingIcon?: ReactNode;
}

export function Button({
  children,
  className = "",
  disabled,
  leadingIcon,
  loading = false,
  loadingLabel = "Working…",
  trailingIcon,
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`button button--${variant} ${className}`.trim()}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      type={type}
      {...props}
    >
      {loading ? <span className="button__spinner" aria-hidden="true" /> : leadingIcon ? <span className="button__icon" aria-hidden="true">{leadingIcon}</span> : null}
      <span>{loading ? loadingLabel : children}</span>
      {!loading && trailingIcon ? <span className="button__icon" aria-hidden="true">{trailingIcon}</span> : null}
    </button>
  );
}
