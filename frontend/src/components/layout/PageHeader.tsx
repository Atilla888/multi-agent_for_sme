import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { DataSourceTag, type DataSource } from "@/components/ui/DataSourceTag";

interface PageHeaderProps {
  readonly title: string;
  /** One plain sentence that says what this screen is for. */
  readonly description?: string;
  /** Where the records on this screen come from; shown as a small tag next to the title. */
  readonly source?: DataSource;
  readonly actions?: ReactNode;
  readonly backHref?: string;
  readonly backLabel?: string;
}

/** Every screen starts with the same header so people always know where they are. */
export function PageHeader({ title, description, source, actions, backHref, backLabel }: PageHeaderProps) {
  return (
    <header className="page-header">
      {backHref ? <Link className="back-link" href={backHref}><Icon name="chevronLeft" size={16} />{backLabel ?? "Back"}</Link> : null}
      <div className="page-header__row">
        <div className="page-header__text">
          <h1>{title}</h1>
          {description ? <p>{description}</p> : null}
        </div>
        {source || actions ? (
          <div className="page-header__aside">
            {source ? <DataSourceTag source={source} /> : null}
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}
