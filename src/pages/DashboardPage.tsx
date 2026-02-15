import { OverallReadiness } from "../components/dashboard/OverallReadiness";
import { SkillBreakdown } from "../components/dashboard/SkillBreakdown";
import { ContinuePractice } from "../components/dashboard/ContinuePractice";
import { WeeklyGoals } from "../components/dashboard/WeeklyGoals";
import { UpcomingAssessments } from "../components/dashboard/UpcomingAssessments";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-0.5">Your placement readiness at a glance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <OverallReadiness />
          <ContinuePractice />
          <UpcomingAssessments />
        </div>
        <div className="space-y-6">
          <SkillBreakdown />
          <WeeklyGoals />
        </div>
      </div>
    </div>
  );
}
