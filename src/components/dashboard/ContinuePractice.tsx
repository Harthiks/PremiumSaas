import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Play } from "lucide-react";

const TOPIC = "Dynamic Programming";
const COMPLETED = 3;
const TOTAL = 10;
const PERCENT = (COMPLETED / TOTAL) * 100;

export function ContinuePractice() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Continue Practice</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm font-medium text-gray-900">{TOPIC}</p>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>{COMPLETED}/{TOTAL} completed</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${PERCENT}%` }}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full sm:w-auto" size="sm">
          <Play className="h-4 w-4 mr-2" />
          Continue
        </Button>
      </CardFooter>
    </Card>
  );
}
