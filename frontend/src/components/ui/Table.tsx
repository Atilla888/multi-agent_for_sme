import type { ComponentPropsWithoutRef } from "react";

interface TableProps extends ComponentPropsWithoutRef<"table"> {
  readonly containerClassName?: string;
  readonly scrollLabel: string;
}

export function Table({ className = "", containerClassName = "", scrollLabel, ...props }: TableProps) {
  return (
    <div className={`table-container ${containerClassName}`.trim()} tabIndex={0} role="region" aria-label={scrollLabel}>
      <table className={`table ${className}`.trim()} {...props} />
    </div>
  );
}

export function TableCaption({ className = "", ...props }: ComponentPropsWithoutRef<"caption">) {
  return <caption className={`table__caption ${className}`.trim()} {...props} />;
}

export function TableHeader(props: ComponentPropsWithoutRef<"thead">) {
  return <thead {...props} />;
}

export function TableBody(props: ComponentPropsWithoutRef<"tbody">) {
  return <tbody {...props} />;
}

export function TableRow({ className = "", ...props }: ComponentPropsWithoutRef<"tr">) {
  return <tr className={`table__row ${className}`.trim()} {...props} />;
}

export function TableHead({ className = "", scope = "col", ...props }: ComponentPropsWithoutRef<"th">) {
  return <th className={`table__head ${className}`.trim()} scope={scope} {...props} />;
}

export function TableCell({ className = "", ...props }: ComponentPropsWithoutRef<"td">) {
  return <td className={`table__cell ${className}`.trim()} {...props} />;
}
