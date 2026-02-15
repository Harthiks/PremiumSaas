import "./layout.css";

export interface ContextHeaderProps {
  headline: string;
  subtext: string;
}

export function ContextHeader({ headline, subtext }: ContextHeaderProps) {
  return (
    <div className="kn-context-header">
      <h1 className="kn-context-header__headline">{headline}</h1>
      <p className="kn-context-header__subtext">{subtext}</p>
    </div>
  );
}
