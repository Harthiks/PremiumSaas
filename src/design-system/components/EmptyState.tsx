import "./components.css";
import { Button } from "./Button";

export interface EmptyStateProps {
  message: string;
  actionLabel: string;
  onAction: () => void;
}

export function EmptyState({
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="kn-empty-state">
      <p className="kn-empty-state__message">{message}</p>
      <div className="kn-empty-state__action">
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}
