import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { runAnalysisAndSave } from "../lib/analyze";
import { Search } from "lucide-react";

export default function AnalyzePage() {
  const navigate = useNavigate();
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jdText, setJdText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const jdTooShort = jdText.trim().length > 0 && jdText.trim().length < 200;

  function handleAnalyze() {
    const trimmed = jdText.trim();
    if (!trimmed) {
      setError("Please paste the job description text.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const entry = runAnalysisAndSave({ company: company.trim(), role: role.trim(), jdText: trimmed });
      navigate(`/results?id=${encodeURIComponent(entry.id)}`);
    } catch (e) {
      setError("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Analyze JD</h1>
        <p className="text-gray-600 mt-0.5">
          Paste a job description to extract skills and get a preparation plan.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company (optional)
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Google, Microsoft"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role (optional)
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. SDE 1, Backend Engineer"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste the full job description here..."
              rows={12}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary resize-y"
            />
            {jdTooShort && (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-1">
                This JD is too short to analyze deeply. Paste full JD for better output.
              </p>
            )}
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <Button
            onClick={handleAnalyze}
            disabled={loading}
            className="min-w-[140px]"
          >
            {loading ? "Analyzing…" : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Analyze
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
