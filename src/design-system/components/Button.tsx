import "./components.css";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const classNames = [
    "kn-btn",
    variant === "primary" ? "kn-btn--primary" : "kn-btn--secondary",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type="button" className={classNames} {...props}>
      {children}
    </button>
  );
}
