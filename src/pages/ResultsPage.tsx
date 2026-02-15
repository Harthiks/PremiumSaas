import { useSearchParams, Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import {
  getEntryById,
  getLatestEntry,
  updateEntry,
  type HistoryEntry,
  type SkillConfidence,
} from "../lib/storage";
import { SKILL_CATEGORIES, getSkillsDisplayName } from "../lib/skills";
import {
  generateCompanyIntel,
  generateRoundMapping,
  type CompanyIntel,
  type RoundMapping,
} from "../lib/companyIntel";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  ArrowLeft,
  Tag,
  ListChecks,
  Calendar,
  MessageCircle,
  Award,
  Copy,
  Download,
  Target,
  Building2,
  GitBranch,
  Info,
} from "lucide-react";

function getAllSkills(entry: HistoryEntry): string[] {
  const { extractedSkills } = entry;
  const fromCategories = extractedSkills.categoryIds.flatMap(
    (catId) => extractedSkills.byCategory[catId] ?? []
  );
  const other = extractedSkills.otherSkills ?? [];
  return [...fromCategories, ...other];
}

function getSkillConfidenceMap(
  entry: HistoryEntry
): Record<string, SkillConfidence> {
  const skills = getAllSkills(entry);
  const map = { ...(entry.skillConfidenceMap ?? {}) };
  skills.forEach((s) => {
    if (map[s] !== "know" && map[s] !== "practice") map[s] = "practice";
  });
  return map;
}

function computeLiveScore(
  baseScore: number,
  skillConfidenceMap: Record<string, SkillConfidence>,
  skillList: string[]
): number {
  let delta = 0;
  skillList.forEach((skill) => {
    const c = skillConfidenceMap[skill] ?? "practice";
    delta += c === "know" ? 2 : -2;
  });
  return Math.min(100, Math.max(0, baseScore + delta));
}

function formatPlanAsText(plan: { title: string; items: string[] }[]): string {
  return plan
    .map(
      (day) =>
        `${day.title}\n${day.items.map((i) => `  • ${i}`).join("\n")}`
    )
    .join("\n\n");
}

function formatChecklistAsText(
  checklist: { name: string; items: string[] }[]
): string {
  return checklist
    .map(
      (round) =>
        `${round.name}\n${round.items.map((i) => `  • ${i}`).join("\n")}`
    )
    .join("\n\n");
}

function formatQuestionsAsText(questions: string[]): string {
  return questions.map((q, i) => `${i + 1}. ${q}`).join("\n");
}

export default function ResultsPage() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [entry, setEntry] = useState<HistoryEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const loadEntry = useCallback(() => {
    const next = id ? getEntryById(id) : getLatestEntry();
    setEntry(next ?? null);
  }, [id]);

  useEffect(() => {
    loadEntry();
    setLoading(false);
  }, [loadEntry]);

  const skillList = entry ? getAllSkills(entry) : [];
  const [skillConfidenceMap, setSkillConfidenceMapState] = useState<
    Record<string, SkillConfidence>
  >({});

  useEffect(() => {
    if (entry) setSkillConfidenceMapState(getSkillConfidenceMap(entry));
  }, [entry?.id]);

  // Backfill company intel & round mapping for older entries; persist to history
  useEffect(() => {
    if (!entry) return;
    let companyIntel: CompanyIntel | null = entry.companyIntel ?? null;
    let roundMapping: RoundMapping | null = entry.roundMapping ?? null;
    let needsUpdate = false;
    if (entry.company.trim() && !companyIntel) {
      companyIntel = generateCompanyIntel(entry.company, entry.jdText);
      needsUpdate = true;
    }
    if (!roundMapping) {
      roundMapping = generateRoundMapping(entry.extractedSkills, companyIntel);
      needsUpdate = true;
    }
    if (needsUpdate) {
      const updated = updateEntry(entry.id, {
        ...(companyIntel && { companyIntel }),
        ...(roundMapping && { roundMapping }),
      });
      if (updated) setEntry(updated);
    }
  }, [entry?.id]);

  const baseScore = entry?.baseScore ?? entry?.readinessScore ?? 0;
  const liveScore = computeLiveScore(
    baseScore,
    skillConfidenceMap,
    skillList
  );

  function setSkillConfidence(skill: string, value: SkillConfidence) {
    if (!entry) return;
    const next = { ...skillConfidenceMap, [skill]: value };
    setSkillConfidenceMapState(next);
    const newFinalScore = computeLiveScore(baseScore, next, skillList);
    const updated = updateEntry(entry.id, {
      skillConfidenceMap: next,
      finalScore: newFinalScore,
      updatedAt: new Date().toISOString(),
    });
    if (updated) setEntry(updated);
  }

  async function copyToClipboard(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(label);
      setTimeout(() => setCopyStatus(null), 2000);
    } catch {
      setCopyStatus("Copy failed");
    }
  }

  function handleCopyPlan() {
    if (!entry) return;
    copyToClipboard(formatPlanAsText(entry.plan), "Plan copied");
  }

  function handleCopyChecklist() {
    if (!entry) return;
    copyToClipboard(formatChecklistAsText(entry.checklist), "Checklist copied");
  }

  function handleCopyQuestions() {
    if (!entry) return;
    copyToClipboard(formatQuestionsAsText(entry.questions), "Questions copied");
  }

  function handleDownloadTxt() {
    if (!entry) return;
    const { company, role, extractedSkills, checklist, plan, questions } =
      entry;
    const title = [company, role].filter(Boolean).join(" - ") || "JD Analysis";
    const skillsText =
      extractedSkills.categoryIds.length === 0
        ? "General fresher stack"
        : extractedSkills.categoryIds
            .map(
              (catId) =>
                `${SKILL_CATEGORIES[catId].label}: ${(extractedSkills.byCategory[catId] ?? []).join(", ")}`
            )
            .join("\n");
    const body = [
      `# ${title}`,
      "",
      "## Key skills extracted",
      skillsText,
      "",
      "## Round-wise preparation checklist",
      formatChecklistAsText(checklist),
      "",
      "## 7-day plan",
      formatPlanAsText(plan),
      "",
      "## 10 likely interview questions",
      formatQuestionsAsText(questions),
    ].join("\n");
    const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `placement-prep-${entry.id.slice(0, 12)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const practiceSkills = skillList.filter(
    (s) => (skillConfidenceMap[s] ?? "practice") === "practice"
  );
  const top3Weak = practiceSkills.slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 mb-4">No analysis found.</p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Button asChild>
                  <Link to="/dashboard/analyze">Analyze a JD</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/dashboard/history">View history</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { company, role, extractedSkills, checklist, plan, questions } = entry;
  const displayName = getSkillsDisplayName(extractedSkills);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Dashboard
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard/history">History</Link>
            </Button>
          </div>
          <div className="text-sm text-gray-500">
            {new Date(entry.createdAt).toLocaleString()}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Analysis results
          </h1>
          {(company || role) && (
            <p className="text-gray-600 mt-0.5">
              {[company, role].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>

        {/* Readiness score (live) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Readiness score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-full border-4 border-primary/30 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">
                  {liveScore}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Updates with your skill self-assessment. Base from JD + ±2 per
                skill (I know / Need practice).
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Company Intel — only when company provided */}
        {entry.company.trim() && entry.companyIntel && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Company intel
              </CardTitle>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Info className="h-3.5 w-3.5" />
                Demo Mode: Company intel generated heuristically.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Company</span>
                  <p className="font-medium text-gray-900">
                    {entry.companyIntel!.companyName}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Industry</span>
                  <p className="font-medium text-gray-900">
                    {entry.companyIntel!.industry}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Estimated size</span>
                  <p className="font-medium text-gray-900">
                    {entry.companyIntel!.sizeLabel}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Typical hiring focus</span>
                  <p className="text-gray-700 leading-relaxed">
                    {entry.companyIntel!.typicalHiringFocus}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Round mapping — vertical timeline */}
        {entry.roundMapping && entry.roundMapping.rounds.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-primary" />
                Round mapping
              </CardTitle>
              <p className="text-sm text-gray-500">
                Based on company size and detected skills.
              </p>
            </CardHeader>
            <CardContent>
              <div className="relative pl-6 space-y-6 border-l-2 border-gray-200">
                {entry.roundMapping.rounds.map((r) => (
                  <div key={r.round} className="relative -left-6">
                    <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-primary border-2 border-white shadow" />
                    <div className="pl-5">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {r.name}
                      </h3>
                      <p className="text-sm text-primary/90 font-medium mt-0.5">
                        {r.description}
                      </p>
                      <p className="text-sm text-gray-600 mt-1.5">
                        {r.whyItMatters}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key skills extracted + toggles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Key skills extracted
            </CardTitle>
            <p className="text-sm text-gray-500">{displayName}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {extractedSkills.categoryIds.length === 0 && !(extractedSkills.otherSkills?.length) ? (
                <span className="text-gray-500 text-sm">
                  General fresher stack (no specific keywords detected)
                </span>
              ) : (
                <>
                  {extractedSkills.categoryIds.map((catId) => {
                    const config = SKILL_CATEGORIES[catId];
                    const skills = extractedSkills.byCategory[catId];
                    if (!skills?.length) return null;
                    return (
                      <div
                        key={catId}
                        className="flex flex-wrap items-center gap-2"
                      >
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {config.label}
                        </span>
                        {skills.map((s) => {
                          const confidence = skillConfidenceMap[s] ?? "practice";
                          return (
                            <div key={s} className="flex items-center gap-1 rounded-md overflow-hidden border border-gray-200">
                              <span className={`text-sm px-2.5 py-1 ${confidence === "know" ? "bg-primary/15 text-primary" : "bg-amber-50 text-amber-800"}`}>{s}</span>
                              <div className="flex">
                                <button type="button" onClick={() => setSkillConfidence(s, "know")} className={`px-2 py-1 text-xs font-medium border-r border-gray-200 ${confidence === "know" ? "bg-primary text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`} title="I know this">I know</button>
                                <button type="button" onClick={() => setSkillConfidence(s, "practice")} className={`px-2 py-1 text-xs font-medium ${confidence === "practice" ? "bg-amber-200 text-amber-900" : "bg-white text-gray-600 hover:bg-gray-50"}`} title="Need practice">Practice</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                  {extractedSkills.otherSkills?.length ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Other</span>
                      {extractedSkills.otherSkills.map((s) => {
                        const confidence = skillConfidenceMap[s] ?? "practice";
                        return (
                          <div key={s} className="flex items-center gap-1 rounded-md overflow-hidden border border-gray-200">
                            <span className={`text-sm px-2.5 py-1 ${confidence === "know" ? "bg-primary/15 text-primary" : "bg-amber-50 text-amber-800"}`}>{s}</span>
                            <div className="flex">
                              <button type="button" onClick={() => setSkillConfidence(s, "know")} className={`px-2 py-1 text-xs font-medium border-r border-gray-200 ${confidence === "know" ? "bg-primary text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`} title="I know this">I know</button>
                              <button type="button" onClick={() => setSkillConfidence(s, "practice")} className={`px-2 py-1 text-xs font-medium ${confidence === "practice" ? "bg-amber-200 text-amber-900" : "bg-white text-gray-600 hover:bg-gray-50"}`} title="Need practice">Practice</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Export tools */}
        <Card>
          <CardHeader>
            <CardTitle>Export</CardTitle>
            <p className="text-sm text-gray-500">
              Copy sections or download everything as a single file.
            </p>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyPlan}
              className="gap-1.5"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy 7-day plan
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyChecklist}
              className="gap-1.5"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy round checklist
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyQuestions}
              className="gap-1.5"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy 10 questions
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTxt}
              className="gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              Download as TXT
            </Button>
            {copyStatus && (
              <span className="text-sm text-primary font-medium self-center ml-2">
                {copyStatus}
              </span>
            )}
          </CardContent>
        </Card>

        {/* Round-wise checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5" />
              Round-wise preparation checklist
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {checklist.map((round) => (
              <div key={round.round}>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  {round.name}
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  {round.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 7-day plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              7-day plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {plan.map((day) => (
              <div key={day.day}>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  {day.title}
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  {day.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 10 likely questions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              10 likely interview questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              {questions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Action Next */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Target className="h-5 w-5 text-primary" />
              Action next
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {top3Weak.length > 0 ? (
              <>
                <p className="text-sm text-gray-700">
                  Top skills to practice:{" "}
                  <span className="font-medium">
                    {top3Weak.join(", ")}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Start Day 1 plan now.
                </p>
                <Button size="sm" asChild>
                  <Link to="/dashboard/practice">Go to Practice</Link>
                </Button>
              </>
            ) : (
              <p className="text-sm text-gray-600">
                All listed skills marked as known. Keep revising and run mock
                interviews.
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
