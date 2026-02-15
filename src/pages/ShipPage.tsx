import { Link } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { allTestsPassed, resetTestChecklist } from "../lib/testChecklist";
import { Lock, Ship, RotateCcw } from "lucide-react";

export default function ShipPage() {
  const [, setTick] = useState(0);
  const locked = !allTestsPassed();

  function handleReset() {
    resetTestChecklist();
    setTick((t) => t + 1);
  }

  if (locked) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <Link to="/dashboard" className="text-sm text-primary hover:underline">
              ← Dashboard
            </Link>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-8">
          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <Lock className="h-5 w-5" />
                Ship locked
              </CardTitle>
              <p className="text-amber-800 text-sm">
                Complete all 10 items on the Test checklist before shipping.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild>
                <Link to="/prp/07-test">Go to Test checklist</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link to="/dashboard" className="text-sm text-primary hover:underline">
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5 text-primary" />
              Ready to ship
            </CardTitle>
            <p className="text-gray-600 text-sm">
              All tests passed. You can ship the Placement Readiness Platform.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="default" className="gap-2">
              <Link to="/prp/proof">Proof & submission</Link>
            </Button>
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset checklist
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
