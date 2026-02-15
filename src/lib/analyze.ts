/**
 * Run full analysis from JD input. No external APIs.
 */

import {
  extractSkills,
  generateChecklist,
  generatePlan,
  generateQuestions,
  computeReadinessScore,
  type ExtractedSkills,
  type ChecklistRound,
  type DayPlan,
} from "./skills";
import { generateCompanyIntel, generateRoundMapping } from "./companyIntel";
import { saveToHistory, type HistoryEntry } from "./storage";

export interface AnalyzeInput {
  company: string;
  role: string;
  jdText: string;
}

export interface AnalysisResult {
  extractedSkills: ExtractedSkills;
  checklist: ChecklistRound[];
  plan: DayPlan[];
  questions: string[];
  readinessScore: number;
}

export function runAnalysis(input: AnalyzeInput): AnalysisResult {
  const { company, role, jdText } = input;
  const extractedSkills = extractSkills(jdText);
  const categoryCount = extractedSkills.categoryIds.length;
  const checklist = generateChecklist(extractedSkills);
  const plan = generatePlan(extractedSkills);
  const questions = generateQuestions(extractedSkills);
  const readinessScore = computeReadinessScore(
    company,
    role,
    jdText,
    categoryCount
  );
  return {
    extractedSkills,
    checklist,
    plan,
    questions,
    readinessScore,
  };
}

export function runAnalysisAndSave(input: AnalyzeInput): HistoryEntry {
  const result = runAnalysis(input);
  const companyIntel = input.company.trim()
    ? generateCompanyIntel(input.company, input.jdText)
    : null;
  const roundMapping = generateRoundMapping(result.extractedSkills, companyIntel ?? null);
  const baseScore = result.readinessScore;
  return saveToHistory({
    company: input.company.trim(),
    role: input.role.trim(),
    jdText: input.jdText,
    extractedSkills: result.extractedSkills,
    plan: result.plan,
    checklist: result.checklist,
    questions: result.questions,
    baseScore,
    ...(companyIntel && { companyIntel }),
    roundMapping,
  });
}
