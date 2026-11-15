import type { SelectHTMLAttributes } from "react";
import { Field } from "./Field";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  readonly containerClassName?: string;
  readonly description?: string;
  readonly error?: string;
  readonly label: string;
}

export function Select({
  children,
  className = "",
  containerClassName = "",
  description,
  error,
  id,
  label,
  required,
  ...props
}: SelectProps) {
  return (
    <Field className={containerClassName} description={description} error={error} id={id} label={label} required={required}>
      {(fieldProps) => (
        <select className={`field__control field__control--select ${className}`.trim()} required={required} {...fieldProps} {...props}>
          {children}
        </select>
      )}
    </Field>
  );
}
