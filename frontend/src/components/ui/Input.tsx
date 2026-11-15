import type { InputHTMLAttributes } from "react";
import { useTranslations } from "next-intl";
import { Field } from "./Field";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  readonly containerClassName?: string;
  readonly description?: string;
  readonly error?: string;
  readonly label: string;
}

export function Input({
  className = "",
  containerClassName = "",
  description,
  error,
  id,
  label,
  required,
  type = "text",
  ...props
}: InputProps) {
  return (
    <Field className={containerClassName} description={description} error={error} id={id} label={label} required={required}>
      {(fieldProps) => (
        <input className={`field__control ${className}`.trim()} required={required} type={type} {...fieldProps} {...props} />
      )}
    </Field>
  );
}

export interface SearchInputProps extends Omit<InputProps, "type"> {
  readonly clearLabel?: string;
  readonly onClear?: () => void;
}

export function SearchInput({
  className = "",
  clearLabel: givenClearLabel,
  containerClassName = "",
  description,
  disabled,
  error,
  id,
  label,
  onClear,
  readOnly,
  required,
  ...props
}: SearchInputProps) {
  const t = useTranslations("common");
  const clearLabel = givenClearLabel ?? t("clearSearch");
  return (
    <Field className={`search-field ${containerClassName}`.trim()} description={description} error={error} id={id} label={label} required={required}>
      {(fieldProps) => (
        <div className="search-field__control-wrap">
          <input
            className={`field__control ${className}`.trim()}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            type="search"
            {...fieldProps}
            {...props}
          />
          {onClear ? (
            <button className="search-field__clear" type="button" aria-label={clearLabel} onClick={onClear} disabled={disabled || readOnly}>
              <span aria-hidden="true">×</span>
            </button>
          ) : null}
        </div>
      )}
    </Field>
  );
}
