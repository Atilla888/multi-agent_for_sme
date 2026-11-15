import { useTranslations } from "next-intl";
import { LoadingState } from "@/components/ui";

export default function StaffLoading() {
  const t = useTranslations("auth.loading");
  return <section aria-label={t("section")} className="business-loading"><LoadingState label={t("label")} lines={5} /></section>;
}
