import { getOverviewFixture, OverviewScreen } from "@/features/overview";

export default function OverviewPage() {
  return <OverviewScreen model={getOverviewFixture()} />;
}
