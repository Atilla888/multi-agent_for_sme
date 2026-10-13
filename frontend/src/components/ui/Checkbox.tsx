import { useId, type InputHTMLAttributes } from "react";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  readonly description?: string;
  readonly error?: string;
  readonly label: string;
}

export function Checkbox({ className = "", description, error, id, label, ...props }: CheckboxProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const descriptionId = description ? `${controlId}-description` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`checkbox-field ${className}`.trim()}>
      <label className="checkbox-field__label" htmlFor={controlId}>
        <input
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className="checkbox-field__control"
          id={controlId}
          type="checkbox"
          {...props}
        />
        <span>{label}</span>
      </label>
      {description ? <p className="field__description" id={descriptionId}>{description}</p> : null}
      {error ? <p className="field__error" id={errorId} role="alert">{error}</p> : null}
    </div>
  );
}
