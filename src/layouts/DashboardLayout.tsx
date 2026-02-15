import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Code2,
  ClipboardCheck,
  BookOpen,
  User,
  Search,
  History,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/practice", label: "Practice", icon: Code2 },
  { to: "/dashboard/assessments", label: "Assessments", icon: ClipboardCheck },
  { to: "/dashboard/resources", label: "Resources", icon: BookOpen },
  { to: "/dashboard/analyze", label: "Analyze JD", icon: Search },
  { to: "/dashboard/history", label: "History", icon: History },
  { to: "/dashboard/profile", label: "Profile", icon: User },
];

export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white">
        <nav className="flex flex-col p-4 gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex-shrink-0 h-14 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">
            Placement Prep
          </h1>
          <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
