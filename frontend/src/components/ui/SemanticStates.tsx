import type { ComponentPropsWithoutRef } from "react";
import { StateNotice } from "./StateNotice";

type SemanticStateProps = Omit<ComponentPropsWithoutRef<typeof StateNotice>, "state">;

export function KnownFailureState(props: SemanticStateProps) {
  return <StateNotice state="known-failure" {...props} />;
}

export function OutcomeUnknownState(props: SemanticStateProps) {
  return <StateNotice state="outcome-unknown" {...props} />;
}

export function ModelNotReadyState(props: SemanticStateProps) {
  return <StateNotice state="model-not-ready" {...props} />;
}

export function PermissionDeniedState(props: SemanticStateProps) {
  return <StateNotice state="permission-denied" {...props} />;
}

export function NotConfiguredState(props: SemanticStateProps) {
  return <StateNotice state="not-configured" {...props} />;
}

export function RestrictedState(props: SemanticStateProps) {
  return <StateNotice state="restricted" {...props} />;
}

export function WaitingHumanState(props: SemanticStateProps) {
  return <StateNotice state="waiting-human" {...props} />;
}
