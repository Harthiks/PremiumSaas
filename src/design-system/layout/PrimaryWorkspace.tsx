import "./layout.css";

export interface PrimaryWorkspaceProps {
  children: React.ReactNode;
}

export function PrimaryWorkspace({ children }: PrimaryWorkspaceProps) {
  return <main className="kn-primary-workspace">{children}</main>;
}
