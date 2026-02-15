/**
 * Persist analysis history in localStorage. Strict schema; corrupt entries skipped.
 */

import type { CategoryId } from "./skills";
import type { ChecklistRound } from "./skills";
import type { DayPlan } from "./skills";
import type { CompanyIntel } from "./companyIntel";
import type { RoundMapping } from "./companyIntel";
import {
  normalizeToCanonical,
  canNormalizeEntry,
  toStoredExtractedSkills,
  type CanonicalHistoryEntry,
} from "./schema";

export type SkillConfidence = import("./schema").SkillConfidence;

/** View model for UI — derived from canonical. */
export interface ExtractedSkillsViewModel {
  byCategory: Record<CategoryId, string[]>;
  categoryIds: CategoryId[];
  hasAny: boolean;
  otherSkills?: string[];
}

export interface HistoryEntry {
  id: string;
  createdAt: string;
  company: string;
  role: string;
  jdText: string;
  extractedSkills: ExtractedSkillsViewModel;
  plan: DayPlan[];
  checklist: ChecklistRound[];
  questions: string[];
  /** Display score = finalScore (updated when user toggles skills). */
  readinessScore: number;
  baseScore: number;
  skillConfidenceMap?: Record<string, SkillConfidence>;
  companyIntel?: CompanyIntel | null;
  roundMapping?: RoundMapping | null;
}

const STORAGE_KEY = "placement-readiness-history";
let lastCorruptedCount = 0;

export function getCorruptedCount(): number {
  return lastCorruptedCount;
}

function loadRaw(): { entries: CanonicalHistoryEntry[]; corruptedCount: number } {
  let corruptedCount = 0;
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (!s) return { entries: [], corruptedCount: 0 };
    const parsed = JSON.parse(s) as unknown;
    if (!Array.isArray(parsed)) return { entries: [], corruptedCount: 1 };
    const entries: CanonicalHistoryEntry[] = [];
    for (const item of parsed) {
      if (!canNormalizeEntry(item)) {
        corruptedCount++;
        continue;
      }
      const canonical = normalizeToCanonical(item);
      if (canonical) entries.push(canonical);
      else corruptedCount++;
    }
    return { entries, corruptedCount };
  } catch {
    return { entries: [], corruptedCount: 1 };
  }
}

function canonicalToViewModel(c: CanonicalHistoryEntry): HistoryEntry {
  const es = c.extractedSkills;
  const byCategory: Record<CategoryId, string[]> = {
    coreCS: es.coreCS ?? [],
    languages: es.languages ?? [],
    web: es.web ?? [],
    data: es.data ?? [],
    cloudDevOps: es.cloud ?? [],
    testing: es.testing ?? [],
  };
  const categoryIds = (["coreCS", "languages", "web", "data", "cloudDevOps", "testing"] as CategoryId[]).filter(
    (id) => (byCategory[id]?.length ?? 0) > 0
  );
  const otherSkills = es.other?.length ? es.other : undefined;

  const plan: DayPlan[] = c.plan7Days.map((p) => ({
    day: p.day,
    title: p.focus,
    items: p.tasks,
  }));

  const checklist: ChecklistRound[] = c.checklist.map((crd, i) => ({
    round: i + 1,
    name: crd.roundTitle,
    items: crd.items,
  }));

  const roundMapping: RoundMapping | null = c.roundMapping?.length
    ? {
        rounds: c.roundMapping.map((r, i) => ({
          round: i + 1,
          name: r.roundTitle,
          description: r.focusAreas?.join(" + ") ?? "",
          whyItMatters: r.whyItMatters,
        })),
      }
    : null;

  return {
    id: c.id,
    createdAt: c.createdAt,
    company: c.company,
    role: c.role,
    jdText: c.jdText,
    extractedSkills: { byCategory, categoryIds, hasAny: categoryIds.length > 0 || (otherSkills?.length ?? 0) > 0, otherSkills },
    plan,
    checklist,
    questions: c.questions,
    readinessScore: c.finalScore,
    baseScore: c.baseScore,
    skillConfidenceMap: c.skillConfidenceMap,
    companyIntel: c.companyIntel,
    roundMapping,
  };
}

function saveRawCanonical(entries: CanonicalHistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // quota or disabled
  }
}

export function getHistory(): HistoryEntry[] {
  const { entries, corruptedCount } = loadRaw();
  lastCorruptedCount = corruptedCount;
  return entries
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .map(canonicalToViewModel);
}

export function getEntryById(id: string): HistoryEntry | null {
  const { entries } = loadRaw();
  const c = entries.find((e) => e.id === id);
  return c ? canonicalToViewModel(c) : null;
}

/** Build canonical entry from analysis output for saving. */
export function saveToHistory(entry: {
  company: string;
  role: string;
  jdText: string;
  extractedSkills: { byCategory: Record<CategoryId, string[]>; categoryIds: CategoryId[]; hasAny: boolean };
  plan: DayPlan[];
  checklist: ChecklistRound[];
  questions: string[];
  baseScore: number;
  roundMapping?: RoundMapping | null;
  companyIntel?: CompanyIntel | null;
}): HistoryEntry {
  const id = `analysis-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const createdAt = new Date().toISOString();
  const updatedAt = createdAt;
  const baseScore = entry.baseScore;
  const finalScore = baseScore;

  const extractedSkills = toStoredExtractedSkills(
    entry.extractedSkills.byCategory,
    entry.extractedSkills.hasAny
  );

  const roundMapping = entry.roundMapping?.rounds?.map((r) => ({
    roundTitle: r.name,
    focusAreas: r.description ? [r.description] : [],
    whyItMatters: r.whyItMatters,
  })) ?? [];

  const checklist = entry.checklist.map((c) => ({
    roundTitle: c.name,
    items: c.items,
  }));

  const plan7Days = entry.plan.map((p) => ({
    day: p.day,
    focus: p.title,
    tasks: p.items,
  }));

  const canonical: CanonicalHistoryEntry = {
    id,
    createdAt,
    company: entry.company ?? "",
    role: entry.role ?? "",
    jdText: entry.jdText,
    extractedSkills,
    roundMapping,
    checklist,
    plan7Days,
    questions: entry.questions,
    baseScore,
    skillConfidenceMap: {},
    finalScore,
    updatedAt,
    companyIntel: entry.companyIntel ?? null,
  };

  const { entries } = loadRaw();
  entries.unshift(canonical);
  saveRawCanonical(entries);
  return canonicalToViewModel(canonical);
}

export function getLatestEntry(): HistoryEntry | null {
  const list = getHistory();
  return list.length > 0 ? list[0] : null;
}

/** Update entry. Persists finalScore and updatedAt when toggling skills. roundMapping can be view (RoundMapping) or stored (RoundMappingItemStored[]). */
export function updateEntry(
  id: string,
  updates: Partial<Pick<CanonicalHistoryEntry, "skillConfidenceMap" | "finalScore" | "updatedAt" | "companyIntel">> & {
    roundMapping?: RoundMapping | { roundTitle: string; focusAreas: string[]; whyItMatters: string }[];
  }
): HistoryEntry | null {
  const { entries } = loadRaw();
  const idx = entries.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  const next = { ...entries[idx] };
  if (updates.skillConfidenceMap !== undefined) next.skillConfidenceMap = updates.skillConfidenceMap;
  if (updates.finalScore !== undefined) next.finalScore = updates.finalScore;
  if (updates.updatedAt !== undefined) next.updatedAt = updates.updatedAt;
  if (updates.companyIntel !== undefined) next.companyIntel = updates.companyIntel;
  if (updates.roundMapping !== undefined) {
    next.roundMapping = Array.isArray(updates.roundMapping)
      ? updates.roundMapping
      : updates.roundMapping.rounds.map((r) => ({
          roundTitle: r.name,
          focusAreas: r.description ? [r.description] : [],
          whyItMatters: r.whyItMatters,
        }));
  }
  if (next.updatedAt === entries[idx].updatedAt && (updates.finalScore !== undefined || updates.skillConfidenceMap !== undefined)) {
    next.updatedAt = new Date().toISOString();
  }
  entries[idx] = next;
  saveRawCanonical(entries);
  return canonicalToViewModel(next);
}

/** Display score = finalScore from entry (set when toggling skills). */
export function getLiveScore(entry: HistoryEntry): number {
  return entry.readinessScore;
}
