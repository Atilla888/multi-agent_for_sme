import { useTranslations } from "next-intl";
import type { ChannelIdentity, CustomerTime } from "../types";

/** Words for a customer's contact channel and times, in the viewer's language. */
export function useCustomerWords() {
  const t = useTranslations("customers");
  return {
    identity: (identity: ChannelIdentity) => t(`identity.${identity.check}`, { channel: identity.channel }),
    time: (at: CustomerTime) => at.day === "today" ? t("time.today", { time: at.time }) : t("time.yesterday"),
  };
}
