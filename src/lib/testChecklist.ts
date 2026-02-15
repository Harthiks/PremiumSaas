/**
 * Test checklist for PRP — persisted in localStorage.
 */

const STORAGE_KEY = "prp-test-checklist";

export const TEST_IDS = [
  "jd-required",
  "short-jd-warning",
  "skills-extraction",
  "round-mapping",
  "score-deterministic",
  "skill-toggles-live",
  "persist-after-refresh",
  "history-saves-loads",
  "export-buttons",
  "no-console-errors",
] as const;

export type TestId = (typeof TEST_IDS)[number];

export interface TestItem {
  id: TestId;
  label: string;
  hint: string;
}

export const TEST_ITEMS: TestItem[] = [
  { id: "jd-required", label: "JD required validation works", hint: "Go to Analyze JD, leave JD empty, click Analyze. You should see an error and submit should not proceed." },
  { id: "short-jd-warning", label: "Short JD warning shows for <200 chars", hint: "Paste fewer than 200 characters in the JD field. The amber warning message should appear below the textarea." },
  { id: "skills-extraction", label: "Skills extraction groups correctly", hint: "Analyze a JD containing e.g. React, DSA, Java. On Results, Key skills extracted should show tags grouped by category (Web, Core CS, Languages)." },
  { id: "round-mapping", label: "Round mapping changes based on company + skills", hint: "Analyze with company 'Amazon' and DSA in JD → Enterprise 4-round flow. Analyze with company 'StartupCo' and React in JD → 3-round practical flow." },
  { id: "score-deterministic", label: "Score calculation is deterministic", hint: "Same JD + company + role should yield the same base score. Re-analyze and confirm score matches." },
  { id: "skill-toggles-live", label: "Skill toggles update score live", hint: "On Results, toggle a skill to 'I know' — the readiness score should increase by 2 immediately. Toggle to 'Practice' — decrease by 2." },
  { id: "persist-after-refresh", label: "Changes persist after refresh", hint: "Toggle some skills on a result, refresh the page, reopen the same result. Toggles and score should be unchanged." },
  { id: "history-saves-loads", label: "History saves and loads correctly", hint: "Run an analysis, go to History. Entry should appear with date, company, role, score. Click it → opens Results for that entry." },
  { id: "export-buttons", label: "Export buttons copy the correct content", hint: "On Results, click 'Copy 7-day plan' then paste elsewhere — should be plain text with day titles and bullets. Same for checklist and questions. Download as TXT should download a file with all sections." },
  { id: "no-console-errors", label: "No console errors on core pages", hint: "Open DevTools Console. Visit /, /dashboard, /dashboard/analyze, run analysis, /results, /dashboard/history. There should be no red errors." },
];

export interface ChecklistState {
  checked: Record<TestId, boolean>;
}

function defaultState(): ChecklistState {
  const checked = {} as Record<TestId, boolean>;
  TEST_IDS.forEach((id) => (checked[id] = false));
  return { checked };
}

function load(): ChecklistState {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (!s) return defaultState();
    const parsed = JSON.parse(s) as { checked?: Record<string, boolean> };
    const checked = parsed?.checked;
    if (!checked || typeof checked !== "object") return defaultState();
    const state = defaultState();
    TEST_IDS.forEach((id) => {
      if (typeof checked[id] === "boolean") {
        state.checked[id] = checked[id];
      }
    });
    return state;
  } catch {
    return defaultState();
  }
}

function save(state: ChecklistState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // quota or disabled
  }
}

export function getTestChecklist(): ChecklistState {
  return load();
}

export function setTestChecklistItem(id: TestId, checked: boolean): ChecklistState {
  const state = load();
  state.checked[id] = checked;
  save(state);
  return state;
}

export function resetTestChecklist(): ChecklistState {
  const state = defaultState();
  save(state);
  return state;
}

export function allTestsPassed(): boolean {
  const state = load();
  return TEST_IDS.every((id) => state.checked[id] === true);
}

export function getTestsPassedCount(): number {
  const state = load();
  return TEST_IDS.filter((id) => state.checked[id]).length;
}
