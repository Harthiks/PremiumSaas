import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Calendar } from "lucide-react";

const ITEMS = [
  { title: "DSA Mock Test", when: "Tomorrow, 10:00 AM" },
  { title: "System Design Review", when: "Wed, 2:00 PM" },
  { title: "HR Interview Prep", when: "Friday, 11:00 AM" },
];

export function UpcomingAssessments() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Assessments</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {ITEMS.map(({ title, when }) => (
            <li
              key={title}
              className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50/50 p-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">{title}</p>
                <p className="text-xs text-gray-500">{when}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
