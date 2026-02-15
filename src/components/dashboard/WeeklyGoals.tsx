import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const SOLVED = 12;
const TARGET = 20;
const PERCENT = (SOLVED / TARGET) * 100;

const DAYS = [
  { label: "Mon", active: true },
  { label: "Tue", active: true },
  { label: "Wed", active: false },
  { label: "Thu", active: true },
  { label: "Fri", active: true },
  { label: "Sat", active: true },
  { label: "Sun", active: false },
];

export function WeeklyGoals() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Goals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Problems Solved: <span className="font-medium text-gray-900">{SOLVED}/{TARGET}</span> this week
          </p>
          <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${PERCENT}%` }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between gap-1">
          {DAYS.map(({ label, active }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1"
              title={active ? "Activity" : "No activity"}
            >
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium ${
                  active ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                {label.slice(0, 1)}
              </div>
              <span className="text-[10px] text-gray-500">{label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
