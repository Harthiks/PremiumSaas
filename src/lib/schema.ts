/**
 * Standardized analysis entry schema. All saved entries conform to this shape.
 */

import type { CategoryId } from "./skills";
import type { CompanyIntel } from "./companyIntel";

export type SkillConfidence = "know" | "practice";

export interface ExtractedSkillsStored {
  coreCS: string[];
  languages: string[];
  web: string[];
  data: string[];
  cloud: string[];
  testing: string[];
  other: string[];
}

export interface RoundMappingItemStored {
  roundTitle: string;
  focusAreas: string[];
  whyItMatters: string;
}

export interface ChecklistRoundStored {
  roundTitle: string;
  items: string[];
}

export interface PlanDayStored {
  day: number;
  focus: string;
  tasks: string[];
}

export interface CanonicalHistoryEntry {
  id: string;
  createdAt: string;
  company: string;
  role: string;
  jdText: string;
  extractedSkills: ExtractedSkillsStored;
  roundMapping: RoundMappingItemStored[];
  checklist: ChecklistRoundStored[];
  plan7Days: PlanDayStored[];
  questions: string[];
  baseScore: number;
  skillConfidenceMap: Record<string, SkillConfidence>;
  finalScore: number;
  updatedAt: string;
  companyIntel?: CompanyIntel | null;
}

const EMPTY_SKILLS: ExtractedSkillsStored = {
  coreCS: [],
  languages: [],
  web: [],
  data: [],
  cloud: [],
  testing: [],
  other: [],
};

export const DEFAULT_OTHER_SKILLS = [
  "Communication",
  "Problem solving",
  "Basic coding",
  "Projects",
];

export function toStoredExtractedSkills(
  byCategory: Record<CategoryId, string[]>,
  hasAny: boolean
): ExtractedSkillsStored {
  return {
    coreCS: byCategory.coreCS ?? [],
    languages: byCategory.languages ?? [],
    web: byCategory.web ?? [],
    data: byCategory.data ?? [],
    cloud: byCategory.cloudDevOps ?? [],
    testing: byCategory.testing ?? [],
    other: hasAny ? [] : [...DEFAULT_OTHER_SKILLS],
  };
}

/** Validate raw parsed entry. Returns true if usable (we can normalize). */
export function canNormalizeEntry(raw: unknown): boolean {
  if (!raw || typeof raw !== "object") return false;
  const o = raw as Record<string, unknown>;
  return typeof o.id === "string" && typeof o.jdText === "string";
}

/** Normalize any legacy or canonical entry into CanonicalHistoryEntry. */
export function normalizeToCanonical(raw: unknown): CanonicalHistoryEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;

  const id = typeof o.id === "string" ? o.id : `legacy-${Date.now()}`;
  const createdAt =
    typeof o.createdAt === "string" ? o.createdAt : new Date().toISOString();
  const company = typeof o.company === "string" ? o.company : "";
  const role = typeof o.role === "string" ? o.role : "";
  const jdText = typeof o.jdText === "string" ? o.jdText : "";
  const updatedAt = typeof o.updatedAt === "string" ? o.updatedAt : createdAt;

  let extractedSkills: ExtractedSkillsStored = { ...EMPTY_SKILLS };
  if (o.extractedSkills && typeof o.extractedSkills === "object") {
    const es = o.extractedSkills as Record<string, unknown>;
    const byCat = es.byCategory as Record<string, string[] | undefined> | undefined;
    if (byCat) {
      const catIds = es.categoryIds as string[] | undefined;
      const noCategories = !catIds || catIds.length === 0;
      extractedSkills = {
        coreCS: byCat.coreCS ?? [],
        languages: byCat.languages ?? [],
        web: byCat.web ?? [],
        data: byCat.data ?? [],
        cloud: byCat.cloudDevOps ?? [],
        testing: byCat.testing ?? [],
        other: Array.isArray(es.other) ? es.other : (noCategories ? DEFAULT_OTHER_SKILLS : []),
      };
    } else {
      extractedSkills = {
        coreCS: Array.isArray(es.coreCS) ? es.coreCS : [],
        languages: Array.isArray(es.languages) ? es.languages : [],
        web: Array.isArray(es.web) ? es.web : [],
        data: Array.isArray(es.data) ? es.data : [],
        cloud: Array.isArray(es.cloud) ? es.cloud : [],
        testing: Array.isArray(es.testing) ? es.testing : [],
        other: Array.isArray(es.other) ? es.other : DEFAULT_OTHER_SKILLS,
      };
    }
  }

  let roundMapping: RoundMappingItemStored[] = [];
  const rm = o.roundMapping;
  if (rm && typeof rm === "object" && Array.isArray((rm as { rounds?: unknown[] }).rounds)) {
    const rounds = (rm as { rounds: { name: string; description: string; whyItMatters: string }[] }).rounds;
    roundMapping = rounds.map((rr) => ({
      roundTitle: rr.name ?? "",
      focusAreas: rr.description ? [rr.description] : [],
      whyItMatters: rr.whyItMatters ?? "",
    }));
  } else if (Array.isArray(rm)) {
    roundMapping = rm.map((r: unknown) => {
      const x = r as Record<string, unknown>;
      return {
        roundTitle: (x.roundTitle as string) ?? "",
        focusAreas: Array.isArray(x.focusAreas) ? x.focusAreas : [],
        whyItMatters: (x.whyItMatters as string) ?? "",
      };
    });
  }

  let checklist: ChecklistRoundStored[] = [];
  if (Array.isArray(o.checklist)) {
    checklist = o.checklist.map((c: unknown) => {
      const x = c as Record<string, unknown>;
      return {
        roundTitle: (x.roundTitle as string) ?? (x.name as string) ?? "",
        items: Array.isArray(x.items) ? x.items : [],
      };
    });
  }

  let plan7Days: PlanDayStored[] = [];
  if (Array.isArray(o.plan)) {
    plan7Days = (o.plan as { day: number; title: string; items: string[] }[]).map((p) => ({
      day: p.day,
      focus: p.title ?? "",
      tasks: p.items ?? [],
    }));
  } else if (Array.isArray(o.plan7Days)) {
    plan7Days = (o.plan7Days as PlanDayStored[]).map((p) => ({
      day: p.day,
      focus: p.focus ?? "",
      tasks: p.tasks ?? [],
    }));
  }

  const questions = Array.isArray(o.questions) ? o.questions : [];
  const baseScore =
    typeof o.baseScore === "number"
      ? o.baseScore
      : typeof o.readinessScore === "number"
        ? o.readinessScore
        : 0;
  const skillConfidenceMap =
    o.skillConfidenceMap && typeof o.skillConfidenceMap === "object"
      ? (o.skillConfidenceMap as Record<string, SkillConfidence>)
      : {};
  const finalScore =
    typeof o.finalScore === "number" ? o.finalScore : baseScore;

  return {
    id,
    createdAt,
    company,
    role,
    jdText,
    extractedSkills,
    roundMapping,
    checklist,
    plan7Days,
    questions,
    baseScore,
    skillConfidenceMap,
    finalScore,
    updatedAt,
    companyIntel: o.companyIntel as CompanyIntel | null | undefined,
  };
}
