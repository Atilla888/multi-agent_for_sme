import { Icon } from "./Icon";

export type DataSource = "sample" | "live";

const copy: Record<DataSource, { readonly label: string; readonly title: string }> = {
  sample: { label: "Sample data", title: "These are example records for review. Nothing on this screen is live business data." },
  live: { label: "Live data", title: "These records come from your business account." },
};

/** Small tag that says whether a screen shows example records or live ones. */
export function DataSourceTag({ source }: { readonly source: DataSource }) {
  const { label, title } = copy[source];
  return (
    <span className={`source-tag source-tag--${source}`} title={title}>
      <Icon name={source === "sample" ? "info" : "check"} size={14} />
      {label}
      <span className="sr-only">. {title}</span>
    </span>
  );
}
