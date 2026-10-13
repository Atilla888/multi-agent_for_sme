import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "aria-label"> {
  readonly "aria-label": string;
  readonly icon: ReactNode;
  readonly loading?: boolean;
}

export function IconButton({
  "aria-label": accessibleName,
  className = "",
  disabled,
  icon,
  loading = false,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      aria-label={accessibleName}
      aria-busy={loading || undefined}
      className={`icon-button ${className}`.trim()}
      disabled={disabled || loading}
      type={type}
      {...props}
    >
      <span aria-hidden="true">{loading ? <span className="button__spinner" /> : icon}</span>
    </button>
  );
}
