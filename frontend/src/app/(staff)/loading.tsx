import { LoadingState } from "@/components/ui";

export default function StaffLoading() {
  return <section aria-label="Loading authorized staff data" className="business-loading"><LoadingState label="Loading the authorized business view" lines={5} /></section>;
}
