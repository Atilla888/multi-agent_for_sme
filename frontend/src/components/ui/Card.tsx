import type { ComponentPropsWithoutRef } from "react";

interface CardProps extends ComponentPropsWithoutRef<"section"> {
  readonly elevated?: boolean;
}

export function Card({ className = "", elevated = false, ...props }: CardProps) {
  return <section className={`card ${elevated ? "card--elevated" : ""} ${className}`.trim()} {...props} />;
}

export function CardHeader({ className = "", ...props }: ComponentPropsWithoutRef<"header">) {
  return <header className={`card__header ${className}`.trim()} {...props} />;
}

export function CardTitle({ className = "", ...props }: ComponentPropsWithoutRef<"h2">) {
  return <h2 className={`card__title ${className}`.trim()} {...props} />;
}

export function CardDescription({ className = "", ...props }: ComponentPropsWithoutRef<"p">) {
  return <p className={`card__description ${className}`.trim()} {...props} />;
}

export function CardContent({ className = "", ...props }: ComponentPropsWithoutRef<"div">) {
  return <div className={`card__content ${className}`.trim()} {...props} />;
}

export function CardFooter({ className = "", ...props }: ComponentPropsWithoutRef<"footer">) {
  return <footer className={`card__footer ${className}`.trim()} {...props} />;
}
