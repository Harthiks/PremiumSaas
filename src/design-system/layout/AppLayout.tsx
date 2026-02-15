import { TopBar, type TopBarProps } from "./TopBar";
import { ContextHeader, type ContextHeaderProps } from "./ContextHeader";
import { PrimaryWorkspace } from "./PrimaryWorkspace";
import { SecondaryPanel, type SecondaryPanelProps } from "./SecondaryPanel";
import { ProofFooter, type ProofFooterProps } from "./ProofFooter";
import "./layout.css";

export interface AppLayoutProps extends TopBarProps, ContextHeaderProps {
  secondaryPanel: SecondaryPanelProps;
  proofFooter?: ProofFooterProps;
  primaryChildren: React.ReactNode;
}

export function AppLayout({
  projectName,
  step,
  totalSteps,
  status,
  headline,
  subtext,
  secondaryPanel,
  proofFooter,
  primaryChildren,
}: AppLayoutProps) {
  return (
    <div className="kn-app-layout">
      <TopBar
        projectName={projectName}
        step={step}
        totalSteps={totalSteps}
        status={status}
      />
      <div className="kn-app-layout__content">
        <ContextHeader headline={headline} subtext={subtext} />
        <div className="kn-main-grid">
          <PrimaryWorkspace>{primaryChildren}</PrimaryWorkspace>
          <SecondaryPanel {...secondaryPanel} />
        </div>
      </div>
      <ProofFooter {...proofFooter} />
    </div>
  );
}
