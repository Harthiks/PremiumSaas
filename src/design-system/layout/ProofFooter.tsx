import "./layout.css";

export interface ProofItem {
  id: string;
  label: string;
  checked?: boolean;
  proofInput?: React.ReactNode;
}

export interface ProofFooterProps {
  items?: ProofItem[];
}

const defaultItems: ProofItem[] = [
  { id: "ui", label: "UI Built" },
  { id: "logic", label: "Logic Working" },
  { id: "test", label: "Test Passed" },
  { id: "deployed", label: "Deployed" },
];

export function ProofFooter({ items = defaultItems }: ProofFooterProps) {
  return (
    <footer className="kn-proof-footer">
      <h2 className="kn-proof-footer__title">Proof</h2>
      <ul className="kn-proof-footer__list">
        {items.map((item) => (
          <li key={item.id} className="kn-proof-item">
            <input
              type="checkbox"
              id={item.id}
              checked={item.checked ?? false}
              readOnly
              aria-label={item.label}
            />
            <label htmlFor={item.id}>{item.label}</label>
            {item.proofInput}
          </li>
        ))}
      </ul>
    </footer>
  );
}
