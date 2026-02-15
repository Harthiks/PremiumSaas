import "./layout.css";

export type TopBarStatus = "not-started" | "in-progress" | "shipped";

export interface TopBarProps {
  projectName: string;
  step: number;
  totalSteps: number;
  status: TopBarStatus;
}

const statusLabel: Record<TopBarStatus, string> = {
  "not-started": "Not Started",
  "in-progress": "In Progress",
  "shipped": "Shipped",
};

export function TopBar({ projectName, step, totalSteps, status }: TopBarProps) {
  const statusClass =
    status === "shipped"
      ? "kn-topbar__status kn-topbar__status--shipped"
      : status === "in-progress"
        ? "kn-topbar__status kn-topbar__status--in-progress"
        : "kn-topbar__status";

  return (
    <header className="kn-topbar">
      <span className="kn-topbar__project">{projectName}</span>
      <span className="kn-topbar__progress">
        Step {step} / {totalSteps}
      </span>
      <span className={statusClass}>{statusLabel[status]}</span>
    </header>
  );
}
