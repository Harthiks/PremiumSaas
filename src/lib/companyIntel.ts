/**
 * Company Intel & Round Mapping — heuristic only, no external APIs.
 */

import type { ExtractedSkills } from "./skills";
import type { CategoryId } from "./skills";

export type CompanySize = "Startup" | "Mid-size" | "Enterprise";

export interface CompanyIntel {
  companyName: string;
  industry: string;
  sizeCategory: CompanySize;
  sizeLabel: string; // e.g. "Enterprise (2000+)"
  typicalHiringFocus: string;
}

const ENTERPRISE_NAMES = [
  "amazon",
  "microsoft",
  "google",
  "meta",
  "apple",
  "infosys",
  "tcs",
  "wipro",
  "accenture",
  "capgemini",
  "cognizant",
  "hcl",
  "tech mahindra",
  "oracle",
  "ibm",
  "salesforce",
  "adobe",
  "netflix",
  "goldman sachs",
  "jpmorgan",
  "morgan stanley",
  "deloitte",
  "ey ",
  "kpmg",
  "pwc",
];

const MID_SIZE_INDICATORS = [
  "mid-size",
  "mid size",
  "500 employees",
  "1000 employees",
  "series b",
  "series c",
];

function normalizeCompany(name: string): string {
  return name.trim().toLowerCase();
}

function inferIndustry(company: string, jdText: string): string {
  const combined = `${company} ${jdText}`.toLowerCase();
  if (/\b(fintech|banking|finance|investment)\b/.test(combined)) return "Financial Services";
  if (/\b(healthcare|health|pharma|medical)\b/.test(combined)) return "Healthcare & Life Sciences";
  if (/\b(retail|ecommerce|e-commerce)\b/.test(combined)) return "Retail & E-commerce";
  if (/\b(edtech|education|learning)\b/.test(combined)) return "EdTech / Education";
  if (/\b(saas|software|product|tech)\b/.test(combined)) return "Technology / SaaS";
  return "Technology Services";
}

export function generateCompanyIntel(
  company: string,
  jdText: string = ""
): CompanyIntel | null {
  const trimmed = company.trim();
  if (!trimmed) return null;

  const normalized = normalizeCompany(trimmed);
  let sizeCategory: CompanySize = "Startup";
  let sizeLabel = "Startup (<200)";

  const isEnterprise = ENTERPRISE_NAMES.some(
    (n) => normalized.includes(n) || normalized.startsWith(n) || normalized === n
  );
  const jdLower = jdText.toLowerCase();
  const hasMidSizeHint = MID_SIZE_INDICATORS.some((h) => jdLower.includes(h));

  if (isEnterprise) {
    sizeCategory = "Enterprise";
    sizeLabel = "Enterprise (2000+)";
  } else if (hasMidSizeHint) {
    sizeCategory = "Mid-size";
    sizeLabel = "Mid-size (200–2000)";
  } else {
    sizeLabel = "Startup (<200)";
  }

  let typicalHiringFocus: string;
  if (sizeCategory === "Enterprise") {
    typicalHiringFocus =
      "Structured DSA and core CS fundamentals; standardized online tests and technical rounds. Strong emphasis on algorithms, system design basics, and behavioral consistency.";
  } else if (sizeCategory === "Mid-size") {
    typicalHiringFocus =
      "Balance of problem-solving and stack depth. Expect mix of coding, system design, and culture fit. Practical experience and project depth matter.";
  } else {
    typicalHiringFocus =
      "Practical problem-solving and stack depth. Hands-on coding, system discussion, and culture fit. Less formal structure; agility and ownership valued.";
  }

  return {
    companyName: trimmed,
    industry: inferIndustry(trimmed, jdText),
    sizeCategory,
    sizeLabel,
    typicalHiringFocus,
  };
}

// ——— Round Mapping ———

export interface RoundMappingItem {
  round: number;
  name: string;
  description: string;
  whyItMatters: string;
}

export interface RoundMapping {
  rounds: RoundMappingItem[];
}

function hasCategory(skills: ExtractedSkills, id: CategoryId): boolean {
  return skills.categoryIds.includes(id);
}

export function generateRoundMapping(
  extractedSkills: ExtractedSkills,
  companyIntel: CompanyIntel | null
): RoundMapping {
  const size = companyIntel?.sizeCategory ?? "Startup";
  const hasDSA = hasCategory(extractedSkills, "coreCS");
  const hasWeb = hasCategory(extractedSkills, "web");
  const hasData = hasCategory(extractedSkills, "data");
  const hasCloud = hasCategory(extractedSkills, "cloudDevOps");

  if (size === "Enterprise" && hasDSA) {
    return {
      rounds: [
        {
          round: 1,
          name: "Round 1: Online Test",
          description: "DSA + Aptitude",
          whyItMatters:
            "Filters for baseline problem-solving and quantitative ability. Strong performance here is required to advance.",
        },
        {
          round: 2,
          name: "Round 2: Technical",
          description: "DSA + Core CS",
          whyItMatters:
            "Deep dive into data structures, algorithms, and CS fundamentals. Demonstrates how you think under pressure.",
        },
        {
          round: 3,
          name: "Round 3: Tech + Projects",
          description: "System design & project discussion",
          whyItMatters:
            "Shows real-world application and design sense. Align your project narrative with the role.",
        },
        {
          round: 4,
          name: "Round 4: HR",
          description: "Behavioral & fit",
          whyItMatters:
            "Assesses culture fit, motivation, and communication. Prepare STAR stories and questions for the interviewer.",
        },
      ],
    };
  }

  if (size === "Enterprise" && !hasDSA) {
    return {
      rounds: [
        {
          round: 1,
          name: "Round 1: Screening",
          description: "Aptitude / Basics",
          whyItMatters: "Initial filter for logical and verbal ability.",
        },
        {
          round: 2,
          name: "Round 2: Technical",
          description: "Domain + Core fundamentals",
          whyItMatters: "Validates technical depth in the required area.",
        },
        {
          round: 3,
          name: "Round 3: Projects & Design",
          description: "Experience & system thinking",
          whyItMatters: "Connects your experience to the role.",
        },
        {
          round: 4,
          name: "Round 4: HR",
          description: "Behavioral & fit",
          whyItMatters: "Final check on communication and values alignment.",
        },
      ],
    };
  }

  if ((size === "Startup" || size === "Mid-size") && hasWeb) {
    return {
      rounds: [
        {
          round: 1,
          name: "Round 1: Practical coding",
          description: "Live coding or take-home",
          whyItMatters:
            "Directly tests coding in the stack they use. Clean, working code matters more than perfect algorithms.",
        },
        {
          round: 2,
          name: "Round 2: System discussion",
          description: "Architecture & trade-offs",
          whyItMatters:
            "Shows you can reason about design and scale. Be ready to discuss your projects.",
        },
        {
          round: 3,
          name: "Round 3: Culture fit",
          description: "Values & collaboration",
          whyItMatters:
            "Smaller teams care strongly about how you work with others and take ownership.",
        },
      ],
    };
  }

  if ((size === "Startup" || size === "Mid-size") && (hasData || hasCloud)) {
    return {
      rounds: [
        {
          round: 1,
          name: "Round 1: Technical screening",
          description: "Core skills + problem-solving",
          whyItMatters: "Quick validation of fundamentals and approach.",
        },
        {
          round: 2,
          name: "Round 2: Deep dive",
          description: "Domain (data/cloud) + projects",
          whyItMatters: "Demonstrates depth in the relevant stack.",
        },
        {
          round: 3,
          name: "Round 3: Team fit",
          description: "Collaboration & mindset",
          whyItMatters: "Ensures you align with how the team works.",
        },
      ],
    };
  }

  // Default: generic flow
  return {
    rounds: [
      {
        round: 1,
        name: "Round 1: Aptitude / Basics",
        description: "Quant, logic, verbal",
        whyItMatters: "Establishes baseline readiness for later rounds.",
      },
      {
        round: 2,
        name: "Round 2: Technical",
        description: "Coding + fundamentals",
        whyItMatters: "Core technical assessment for the role.",
      },
      {
        round: 3,
        name: "Round 3: Projects & HR",
        description: "Experience + fit",
        whyItMatters: "Combined check on experience and communication.",
      },
    ],
  };
}
