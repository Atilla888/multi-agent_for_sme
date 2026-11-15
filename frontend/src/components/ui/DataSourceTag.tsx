import { useTranslations } from "next-intl";
import { Icon } from "./Icon";

export type DataSource = "sample" | "live";

/** Small tag that says whether a screen shows example records or live ones. */
export function DataSourceTag({ source }: { readonly source: DataSource }) {
  const t = useTranslations("common.dataSource");
  const label = t(`${source}.label`);
  const title = t(`${source}.title`);
  return (
    <span className={`source-tag source-tag--${source}`} title={title}>
      <Icon name={source === "sample" ? "info" : "check"} size={14} />
      {label}
      <span className="sr-only">. {title}</span>
    </span>
  );
}
