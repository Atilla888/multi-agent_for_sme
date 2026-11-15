import { useTranslations } from "next-intl";
import type { OrderLabel, OrderTime, ReservationLabel } from "../types";

/** Words for an order's status labels and times, in the viewer's language. Shared status words come from `states`. */
export function useOrderWords() {
  const t = useTranslations("orders");
  const states = useTranslations("states");
  return {
    orderLabel: (label: OrderLabel) => label === "created" ? t("labels.created") : states(`${label}.label`),
    reservationLabel: (label: ReservationLabel) => label === "outcome-unknown" ? states(`${label}.label`) : t(`labels.${label}`),
    time: (at: OrderTime) => t("today", { time: at.time }),
  };
}
