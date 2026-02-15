import "./components.css";
import { Button } from "./Button";

export interface ErrorStateProps {
  title?: string;
  message: string;
  fixSuggestion: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  fixSuggestion,
  actionLabel,
  onAction,
}: ErrorStateProps) {
  return (
    <div className="kn-error-state">
      <h3 className="kn-error-state__title">{title}</h3>
      <p className="kn-error-state__message">{message}</p>
      <p className="kn-error-state__fix">{fixSuggestion}</p>
      {actionLabel != null && onAction != null && (
        <div className="kn-empty-state__action">
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
