import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  getFinalSubmission,
  setFinalSubmission,
  getStepCompletion,
  setStepCompleted,
  getFinalSubmissionText,
  isShipped,
  isValidUrl,
  STEP_IDS,
  STEP_LABELS,
  type StepId,
  type FinalSubmission,
} from "../lib/proofSubmission";
import { CheckCircle2, Circle, Copy, FileCheck } from "lucide-react";

export default function ProofPage() {
  const [submission, setSubmissionState] = useState<FinalSubmission>(() =>
    getFinalSubmission()
  );
  const [steps, setStepsState] = useState(() => getStepCompletion());
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ lovable?: string; github?: string; deployed?: string }>({});

  const shipped = isShipped();

  function handleStepToggle(id: StepId, completed: boolean) {
    setStepsState(setStepCompleted(id, completed));
  }

  function handleLinkChange(
    field: keyof FinalSubmission,
    value: string
  ) {
    const next = setFinalSubmission({ [field]: value });
    setSubmissionState(next);
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validateField(value: string): string | undefined {
    if (!value.trim()) return "Required";
    if (!isValidUrl(value)) return "Enter a valid URL (http or https)";
    return undefined;
  }

  function handleBlur(field: keyof FinalSubmission) {
    const value = submission[field];
    setErrors((e) => ({ ...e, [field]: validateField(value) }));
  }

  async function handleCopyFinalSubmission() {
    const text = getFinalSubmissionText();
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("Copied to clipboard");
      setTimeout(() => setCopyStatus(null), 2500);
    } catch {
      setCopyStatus("Copy failed");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="text-sm text-primary hover:underline">
            ← Dashboard
          </Link>
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded border ${
              shipped
                ? "border-green-600 text-green-700 bg-green-50"
                : "border-amber-600 text-amber-700 bg-amber-50"
            }`}
          >
            {shipped ? "Shipped" : "In Progress"}
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Proof & submission</h1>
          <p className="text-gray-600 mt-0.5">
            Complete all steps and provide links to mark the project as shipped.
          </p>
        </div>

        {shipped && (
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="pt-6">
              <p className="text-gray-800 text-center leading-relaxed">
                You built a real product.
                <br />
                Not a tutorial. Not a clone.
                <br />
                A structured tool that solves a real problem.
                <br />
                <span className="font-semibold">This is your proof of work.</span>
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Step completion overview</CardTitle>
            <p className="text-sm text-gray-500">
              Mark each step when complete. All 8 must be completed for Shipped status.
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {STEP_IDS.map((id) => {
              const completed = steps.completed[id];
              return (
                <div
                  key={id}
                  className="flex items-center gap-3 rounded-lg border border-gray-100 p-3"
                >
                  <button
                    type="button"
                    onClick={() => handleStepToggle(id, !completed)}
                    className="flex items-center gap-2 text-left flex-1"
                  >
                    {completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    )}
                    <span className="text-sm font-medium text-gray-900">
                      {STEP_LABELS[id]}
                    </span>
                  </button>
                  <span className="text-xs text-gray-500">
                    {completed ? "Completed" : "Pending"}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Artifact inputs (required for Ship status)</CardTitle>
            <p className="text-sm text-gray-500">
              Provide valid URLs. All three are required for Shipped status.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lovable Project Link <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={submission.lovableUrl}
                onChange={(e) => handleLinkChange("lovableUrl", e.target.value)}
                onBlur={() => handleBlur("lovableUrl")}
                placeholder="https://..."
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:ring-primary ${
                  errors.lovable ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.lovable && (
                <p className="text-xs text-red-600 mt-1">{errors.lovable}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GitHub Repository Link <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={submission.githubUrl}
                onChange={(e) => handleLinkChange("githubUrl", e.target.value)}
                onBlur={() => handleBlur("githubUrl")}
                placeholder="https://github.com/..."
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:ring-primary ${
                  errors.github ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.github && (
                <p className="text-xs text-red-600 mt-1">{errors.github}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deployed URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={submission.deployedUrl}
                onChange={(e) => handleLinkChange("deployedUrl", e.target.value)}
                onBlur={() => handleBlur("deployedUrl")}
                placeholder="https://..."
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:ring-primary ${
                  errors.deployed ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.deployed && (
                <p className="text-xs text-red-600 mt-1">{errors.deployed}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-primary" />
              Final submission export
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleCopyFinalSubmission}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy Final Submission
            </Button>
            {copyStatus && (
              <span className="ml-3 text-sm text-primary font-medium">
                {copyStatus}
              </span>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
