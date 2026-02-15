/**
 * Skill extraction and analysis logic (heuristic, no external APIs).
 * Case-insensitive keyword detection from JD text.
 */

export const SKILL_CATEGORIES = {
  coreCS: {
    label: "Core CS",
    keywords: ["DSA", "OOP", "DBMS", "OS", "Networks"],
  },
  languages: {
    label: "Languages",
    keywords: ["Java", "Python", "JavaScript", "TypeScript", "C", "C++", "C#", "Go"],
  },
  web: {
    label: "Web",
    keywords: ["React", "Next.js", "Node.js", "Express", "REST", "GraphQL"],
  },
  data: {
    label: "Data",
    keywords: ["SQL", "MongoDB", "PostgreSQL", "MySQL", "Redis"],
  },
  cloudDevOps: {
    label: "Cloud/DevOps",
    keywords: ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD", "Linux"],
  },
  testing: {
    label: "Testing",
    keywords: ["Selenium", "Cypress", "Playwright", "JUnit", "PyTest"],
  },
} as const;

export type CategoryId = keyof typeof SKILL_CATEGORIES;

export interface ExtractedSkills {
  byCategory: Record<CategoryId, string[]>;
  categoryIds: CategoryId[];
  hasAny: boolean;
}

const FALLBACK_LABEL = "General fresher stack";

export function extractSkills(jdText: string): ExtractedSkills {
  const lower = jdText.trim().toLowerCase();
  const byCategory: Record<CategoryId, string[]> = {
    coreCS: [],
    languages: [],
    web: [],
    data: [],
    cloudDevOps: [],
    testing: [],
  };

  for (const [catId, config] of Object.entries(SKILL_CATEGORIES)) {
    const keywords = [...(config as { keywords: readonly string[] }).keywords];
    const found: string[] = [];
    for (const kw of keywords) {
      const regex = new RegExp(`\\b${escapeRegex(kw)}\\b`, "gi");
      if (regex.test(lower)) found.push(kw);
    }
    byCategory[catId as CategoryId] = [...new Set(found)];
  }

  const categoryIds = (Object.keys(byCategory) as CategoryId[]).filter(
    (id) => byCategory[id].length > 0
  );
  const hasAny = categoryIds.length > 0;

  return { byCategory, categoryIds, hasAny };
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function getSkillsDisplayName(extracted: ExtractedSkills): string {
  if (!extracted.hasAny) return FALLBACK_LABEL;
  return extracted.categoryIds
    .flatMap((id) => extracted.byCategory[id])
    .join(", ") || FALLBACK_LABEL;
}

// ——— Round-wise checklist (5–8 items per round based on skills) ———

export interface ChecklistRound {
  round: number;
  name: string;
  items: string[];
}

export function generateChecklist(extracted: ExtractedSkills): ChecklistRound[] {
  const { byCategory, categoryIds } = extracted;
  const has = (id: CategoryId) => categoryIds.includes(id);
  const list = (id: CategoryId) => byCategory[id] ?? [];

  const rounds: ChecklistRound[] = [
    {
      round: 1,
      name: "Round 1: Aptitude / Basics",
      items: [
        "Revise quantitative aptitude (percentages, ratios, time-speed-distance).",
        "Practice logical reasoning and pattern recognition.",
        "Review verbal ability and reading comprehension.",
        "Time yourself on sample aptitude tests.",
        "Brush up basic grammar and error correction.",
        has("coreCS") ? "Quick revision of CS fundamentals (OS, DBMS, Networks)." : "Review basic computer fundamentals.",
        "Prepare short self-introduction (1–2 min).",
        "List 3–5 strengths and weaknesses with examples.",
      ].slice(0, 8),
    },
    {
      round: 2,
      name: "Round 2: DSA + Core CS",
      items: [
        ...(has("coreCS")
          ? [
              "Revise arrays, strings, and two-pointer techniques.",
              "Practice 5–10 problems on trees and graphs.",
              "Review hash maps and sliding window patterns.",
              "Revise OOP concepts (inheritance, polymorphism, encapsulation).",
              "Brush up OS (processes, threads, scheduling, memory).",
              "Revise DBMS (ACID, normalization, indexing).",
              "Quick revision of computer networks (TCP/IP, HTTP).",
            ]
          : [
              "Practice 10–15 array and string problems.",
              "Revise basic data structures (array, linked list, stack, queue).",
              "Review time and space complexity (Big O).",
              "Practice 5 tree/graph problems.",
              "Revise basic OOP and DBMS concepts.",
            ]),
        "Prepare 2–3 coding approaches you can explain clearly.",
      ].slice(0, 8),
    },
    {
      round: 3,
      name: "Round 3: Tech interview (projects + stack)",
      items: [
        ...(has("languages")
          ? [
              `Prepare to explain projects using ${list("languages").slice(0, 2).join(" and ")}.`,
              "Document design decisions and trade-offs in your projects.",
            ]
          : ["Prepare to explain 2 projects in depth (problem, solution, impact)."]),
        ...(has("web")
          ? [
              "Revise React/Vue lifecycle and state management (if applicable).",
              "Prepare REST/API design and status codes.",
              list("web").some((w) => /graphql/i.test(w)) ? "Revise GraphQL vs REST and when to use each." : "",
            ].filter(Boolean)
          : []),
        ...(has("data")
          ? [
              "Revise SQL joins, subqueries, and indexing.",
              list("data").some((d) => /mongo|redis/i.test(d)) ? "Prepare to compare SQL vs NoSQL use cases." : "",
            ].filter(Boolean)
          : ["Revise basic SQL and database concepts."]),
        ...(has("cloudDevOps")
          ? [
              "Prepare to explain any Docker/CI usage in projects.",
              "Revise cloud basics (EC2/S3 or equivalent) if you used them.",
            ]
          : []),
        ...(has("testing") ? ["Prepare to explain testing strategy in your projects."] : []),
        "Align resume bullet points with STAR format (Situation, Task, Action, Result).",
      ].slice(0, 8),
    },
    {
      round: 4,
      name: "Round 4: Managerial / HR",
      items: [
        "Prepare 'Tell me about yourself' (2 min, role-focused).",
        "List 3–5 behavioral examples (conflict, leadership, failure, teamwork).",
        "Prepare questions to ask the interviewer (team, role, growth).",
        "Research the company (products, culture, recent news).",
        "Prepare salary expectations (if applicable) and rationale.",
        "Practice 'Why us?' and 'Why this role?'.",
        "Review your resume for gaps and be ready to explain any.",
        "Prepare closing statement showing enthusiasm.",
      ].slice(0, 8),
    },
  ];

  return rounds.map((r) => ({ ...r, items: r.items.filter(Boolean).slice(0, 8) }));
}

// ——— 7-day plan (adapted to detected skills) ———

export interface DayPlan {
  day: number;
  title: string;
  items: string[];
}

export function generatePlan(extracted: ExtractedSkills): DayPlan[] {
  const { categoryIds, hasAny } = extracted;
  const has = (id: CategoryId) => categoryIds.includes(id);
  const webFocus = has("web");
  const dsaFocus = has("coreCS");
  const dataFocus = has("data");

  return [
    {
      day: 1,
      title: "Day 1–2: Basics + Core CS",
      items: [
        "Revise aptitude (quant, logical, verbal).",
        "Revise OS: processes, threads, scheduling, memory management.",
        "Revise DBMS: normalization, indexing, transactions.",
        "Revise computer networks: TCP/IP, HTTP, basics of security.",
        hasAny ? "Skim through JD again and note must-have topics." : "List 5 core CS topics from typical JDs.",
      ],
    },
    {
      day: 2,
      title: "Day 3–4: DSA + Coding practice",
      items: [
        dsaFocus ? "Practice 5–8 problems: arrays, strings, hash map." : "Practice 8–10 array/string problems.",
        "Practice 3–4 problems on trees and graphs.",
        "Revise recursion and dynamic programming basics.",
        "Time yourself (30–45 min per problem).",
        "Note patterns: two-pointer, sliding window, BFS/DFS.",
      ],
    },
    {
      day: 3,
      title: "Day 5: Project + Resume alignment",
      items: [
        "Document 2 projects with problem, your role, tech stack, outcome.",
        "Align each bullet with STAR format.",
        webFocus ? "Highlight frontend/backend and deployment (if any)." : "Highlight tech stack and impact.",
        "Ensure resume keywords match JD (skills already extracted).",
        "Prepare 2-min verbal project summary.",
      ],
    },
    {
      day: 4,
      title: "Day 6: Mock interview questions",
      items: [
        "Practice 5 CS conceptual questions (OS, DBMS, networks).",
        "Practice 2–3 coding questions out loud (explain approach first).",
        "Prepare 3 behavioral stories (conflict, leadership, failure).",
        "Practice 'Tell me about yourself' and 'Why us?'.",
        dataFocus ? "Revise SQL and DB design questions." : "Revise 2–3 DB/SQL questions.",
      ],
    },
    {
      day: 5,
      title: "Day 7: Revision + Weak areas",
      items: [
        "Revise weak topics identified in last 6 days.",
        "Quick DSA revision (2–3 problems).",
        "Re-read JD and match your prep to requirements.",
        webFocus ? "Quick revision: React/Node concepts and one project." : "Quick revision: one project end-to-end.",
        "Rest and stay calm; avoid cramming new topics.",
      ],
    },
  ];
}

// ——— 10 likely interview questions (skill-based) ———

export function generateQuestions(extracted: ExtractedSkills): string[] {
  const { byCategory, categoryIds } = extracted;
  const has = (id: CategoryId) => categoryIds.includes(id);
  const list = (id: CategoryId) => byCategory[id] ?? [];
  const questions: string[] = [];

  if (has("coreCS")) {
    questions.push("How would you optimize search in sorted data? Discuss time complexity.");
    questions.push("Explain the difference between process and thread. When would you use multithreading?");
    questions.push("What is normalization in DBMS? Explain 3NF with an example.");
  }
  if (has("languages")) {
    const langs = list("languages");
    if (langs.some((l) => /java/i.test(l))) questions.push("Explain Java memory model and garbage collection in brief.");
    if (langs.some((l) => /python/i.test(l))) questions.push("How does Python manage memory? What are decorators and when to use them?");
    if (langs.some((l) => /javascript|typescript/i.test(l))) questions.push("Explain event loop in JavaScript and async/await.");
  }
  if (has("web")) {
    if (list("web").some((w) => /react/i.test(w))) questions.push("Explain state management options in React (useState, context, Redux).");
    if (list("web").some((w) => /node|express/i.test(w))) questions.push("How would you design a REST API for a given resource? Discuss status codes and idempotency.");
    if (list("web").some((w) => /graphql/i.test(w))) questions.push("When would you choose GraphQL over REST?");
  }
  if (has("data")) {
    questions.push("Explain indexing in databases and when it helps. What are B-trees?");
    if (list("data").some((d) => /mongo|nosql/i.test(d))) questions.push("Compare SQL and NoSQL. When would you use each?");
  }
  if (has("cloudDevOps")) {
    questions.push("Explain Docker in simple terms. What is the difference between image and container?");
    questions.push("What is CI/CD? How would you automate tests in a pipeline?");
  }
  if (has("testing")) {
    questions.push("How would you test a login flow? What types of tests would you write?");
  }

  const generic = [
    "Tell me about a challenging bug you fixed and how you approached it.",
    "Describe a project where you had to learn a new technology quickly.",
    "How do you handle disagreements in a team? Give an example.",
    "Where do you see yourself in 3–5 years?",
    "What is your biggest weakness and how are you working on it?",
  ];
  let g = 0;
  while (questions.length < 10 && g < 20) {
    const q = generic[g % generic.length];
    if (!questions.includes(q)) questions.push(q);
    g++;
  }
  return questions.slice(0, 10);
}

// ——— Readiness score (0–100) ———

export function computeReadinessScore(
  company: string,
  role: string,
  jdText: string,
  categoryCount: number
): number {
  let score = 35;
  score += Math.min(categoryCount * 5, 30);
  if (company.trim().length > 0) score += 10;
  if (role.trim().length > 0) score += 10;
  if (jdText.trim().length > 800) score += 10;
  return Math.min(100, Math.max(0, score));
}
