/**
 * Proof + Final Submission — persisted in localStorage.
 * Shipped status only when: 8 steps completed, 10 tests passed, 3 links provided.
 */

import { allTestsPassed } from "./testChecklist";

const SUBMISSION_KEY = "prp_final_submission";
const STEPS_KEY = "prp_step_completion";

export const STEP_IDS = [
  "step1",
  "step2",
  "step3",
  "step4",
  "step5",
  "step6",
  "step7",
  "step8",
] as const;

export type StepId = (typeof STEP_IDS)[number];

export const STEP_LABELS: Record<StepId, string> = {
  step1: "Landing & Get Started",
  step2: "JD Analyze & Skill Extraction",
  step3: "Round Mapping & Company Intel",
  step4: "7-Day Plan & Round Checklist",
  step5: "Readiness Score & Skill Toggles",
  step6: "History & Persistence",
  step7: "Test Checklist Passed",
  step8: "Proof Links (Lovable, GitHub, Deployed)",
};

export interface FinalSubmission {
  lovableUrl: string;
  githubUrl: string;
  deployedUrl: string;
}

export interface StepCompletion {
  completed: Record<StepId, boolean>;
}

const EMPTY_SUBMISSION: FinalSubmission = {
  lovableUrl: "",
  githubUrl: "",
  deployedUrl: "",
};

function defaultSteps(): StepCompletion {
  const completed = {} as Record<StepId, boolean>;
  STEP_IDS.forEach((id) => (completed[id] = false));
  return { completed };
}

/** Validate URL: must start with http:// or https:// and parse. */
export function isValidUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const u = new URL(trimmed);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function loadSubmission(): FinalSubmission {
  try {
    const s = localStorage.getItem(SUBMISSION_KEY);
    if (!s) return { ...EMPTY_SUBMISSION };
    const parsed = JSON.parse(s) as unknown;
    if (!parsed || typeof parsed !== "object") return { ...EMPTY_SUBMISSION };
    const p = parsed as Record<string, unknown>;
    return {
      lovableUrl: typeof p.lovableUrl === "string" ? p.lovableUrl : "",
      githubUrl: typeof p.githubUrl === "string" ? p.githubUrl : "",
      deployedUrl: typeof p.deployedUrl === "string" ? p.deployedUrl : "",
    };
  } catch {
    return { ...EMPTY_SUBMISSION };
  }
}

function saveSubmission(sub: FinalSubmission): void {
  try {
    localStorage.setItem(SUBMISSION_KEY, JSON.stringify(sub));
  } catch {
    //
  }
}

function loadSteps(): StepCompletion {
  try {
    const s = localStorage.getItem(STEPS_KEY);
    if (!s) return defaultSteps();
    const parsed = JSON.parse(s) as unknown;
    if (!parsed || typeof parsed !== "object" || !(parsed as Record<string, unknown>).completed)
      return defaultSteps();
    const state = defaultSteps();
    const completed = (parsed as { completed: Record<string, boolean> }).completed;
    STEP_IDS.forEach((id) => {
      if (typeof completed[id] === "boolean") state.completed[id] = completed[id];
    });
    return state;
  } catch {
    return defaultSteps();
  }
}

function saveSteps(steps: StepCompletion): void {
  try {
    localStorage.setItem(STEPS_KEY, JSON.stringify(steps));
  } catch {
    //
  }
}

export function getFinalSubmission(): FinalSubmission {
  return loadSubmission();
}

export function setFinalSubmission(updates: Partial<FinalSubmission>): FinalSubmission {
  const next = { ...loadSubmission(), ...updates };
  saveSubmission(next);
  return next;
}

export function getStepCompletion(): StepCompletion {
  return loadSteps();
}

export function setStepCompleted(id: StepId, completed: boolean): StepCompletion {
  const state = loadSteps();
  state.completed[id] = completed;
  saveSteps(state);
  return state;
}

/** All 3 links provided and valid. */
export function hasAllValidLinks(): boolean {
  const sub = loadSubmission();
  return (
    isValidUrl(sub.lovableUrl) &&
    isValidUrl(sub.githubUrl) &&
    isValidUrl(sub.deployedUrl)
  );
}

/** All 8 steps marked completed. */
export function allStepsCompleted(): boolean {
  const state = loadSteps();
  return STEP_IDS.every((id) => state.completed[id] === true);
}

/** Shipped only when: 8 steps done, 10 tests passed, 3 links valid. Does not bypass checklist lock. */
export function isShipped(): boolean {
  return allStepsCompleted() && allTestsPassed() && hasAllValidLinks();
}

/** Formatted final submission text for copy. */
export function getFinalSubmissionText(): string {
  const sub = loadSubmission();
  return `------------------------------------------
Placement Readiness Platform — Final Submission

Lovable Project: ${sub.lovableUrl || "(not set)"}
GitHub Repository: ${sub.githubUrl || "(not set)"}
Live Deployment: ${sub.deployedUrl || "(not set)"}

Core Capabilities:
- JD skill extraction (deterministic)
- Round mapping engine
- 7-day prep plan
- Interactive readiness scoring
- History persistence
------------------------------------------`;
}
