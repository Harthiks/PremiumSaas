import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  getTestChecklist,
  setTestChecklistItem,
  resetTestChecklist,
  getTestsPassedCount,
  TEST_ITEMS,
  type TestId,
  type ChecklistState,
} from "../lib/testChecklist";
import { CheckSquare, RotateCcw, ChevronRight, HelpCircle } from "lucide-react";

export default function TestChecklistPage() {
  const [state, setState] = useState<ChecklistState>(() => getTestChecklist());
  const passed = getTestsPassedCount();
  const total = TEST_ITEMS.length;
  const allPassed = passed === total;

  function handleToggle(id: TestId, checked: boolean) {
    const next = setTestChecklistItem(id, checked);
    setState(next);
  }

  function handleReset() {
    setState(resetTestChecklist());
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link
            to="/dashboard"
            className="text-sm text-primary hover:underline"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Test checklist
          </h1>
          <p className="text-gray-600 mt-0.5">
            Verify placement readiness flows before shipping.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-primary" />
              Tests passed: {passed} / {total}
            </CardTitle>
            {!allPassed && (
              <p className="text-amber-700 text-sm font-medium">
                Fix issues before shipping.
              </p>
            )}
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {TEST_ITEMS.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-lg border border-gray-100 p-3"
              >
                <input
                  type="checkbox"
                  id={item.id}
                  checked={state.checked[item.id] ?? false}
                  onChange={(e) =>
                    handleToggle(item.id, e.target.checked)
                  }
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <div className="flex-1 min-w-0">
                  <label
                    htmlFor={item.id}
                    className="text-sm font-medium text-gray-900 cursor-pointer"
                  >
                    {item.label}
                  </label>
                  <p className="text-xs text-gray-500 mt-1 flex items-start gap-1">
                    <HelpCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                    <span>{item.hint}</span>
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset checklist
          </Button>
          {allPassed && (
            <Button asChild className="gap-2">
              <Link to="/prp/08-ship">
                Go to Ship
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
