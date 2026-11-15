import type { TextareaHTMLAttributes } from "react";
import { Field } from "./Field";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  readonly containerClassName?: string;
  readonly description?: string;
  readonly error?: string;
  readonly label: string;
}

export function Textarea({
  className = "",
  containerClassName = "",
  description,
  error,
  id,
  label,
  required,
  rows = 4,
  ...props
}: TextareaProps) {
  return (
    <Field className={containerClassName} description={description} error={error} id={id} label={label} required={required}>
      {(fieldProps) => (
        <textarea className={`field__control field__control--textarea ${className}`.trim()} required={required} rows={rows} {...fieldProps} {...props} />
      )}
    </Field>
  );
}
