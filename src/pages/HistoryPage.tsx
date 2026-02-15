import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { getHistory, getLiveScore, getCorruptedCount, type HistoryEntry } from "../lib/storage";
import { History, Building2, Briefcase, ChevronRight } from "lucide-react";

export default function HistoryPage() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [corruptedCount, setCorruptedCount] = useState(0);

  useEffect(() => {
    setEntries(getHistory());
    setCorruptedCount(getCorruptedCount());
  }, []);

  function openResult(entry: HistoryEntry) {
    navigate(`/results?id=${encodeURIComponent(entry.id)}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Analysis history</h1>
        <p className="text-gray-600 mt-0.5">
          Past JD analyses. Click one to view full results.
        </p>
      </div>

      {corruptedCount > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          One saved entry couldn&apos;t be loaded. Create a new analysis.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Saved analyses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="text-gray-500 text-sm py-4">
              No analyses yet. Use &quot;Analyze JD&quot; to analyze a job description.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {entries.map((entry) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={() => openResult(entry)}
                    className="w-full flex items-center gap-4 py-4 text-left hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        {entry.company ? (
                          <span className="font-medium text-gray-900 flex items-center gap-1">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            {entry.company}
                          </span>
                        ) : (
                          <span className="text-gray-400">No company</span>
                        )}
                        {entry.role && (
                          <span className="text-gray-600 flex items-center gap-1">
                            <Briefcase className="h-4 w-4 text-gray-400" />
                            {entry.role}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(entry.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-primary">
                        Score: {getLiveScore(entry)}
                      </span>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
