import "./layout.css";
import "../components/components.css";
import { Button } from "../components/Button";

export interface SecondaryPanelProps {
  stepTitle?: string;
  explanation: string;
  copyableContent?: string;
  children?: React.ReactNode;
}

export function SecondaryPanel({
  stepTitle = "Step",
  explanation,
  copyableContent,
  children,
}: SecondaryPanelProps) {
  return (
    <aside className="kn-secondary-panel">
      <h2 className="kn-secondary-panel__title">{stepTitle}</h2>
      <p className="kn-secondary-panel__explanation">{explanation}</p>
      {copyableContent != null && (
        <div className="kn-copyable-box">
          <pre className="kn-copyable-box__content">{copyableContent}</pre>
          <Button variant="secondary" className="kn-copyable-box__btn">
            Copy
          </Button>
        </div>
      )}
      {children ?? (
        <div className="kn-btn-group">
          <Button variant="primary">Build in Lovable</Button>
          <Button variant="secondary">It Worked</Button>
          <Button variant="secondary">Error</Button>
          <Button variant="secondary">Add Screenshot</Button>
        </div>
      )}
    </aside>
  );
}
