import { Link } from "react-router-dom";
import { Code2, Video, BarChart3 } from "lucide-react";

const features = [
  {
    title: "Practice Problems",
    description: "Sharpen your skills with curated problems and detailed solutions.",
    icon: Code2,
  },
  {
    title: "Mock Interviews",
    description: "Simulate real interviews with timed sessions and feedback.",
    icon: Video,
  },
  {
    title: "Track Progress",
    description: "Monitor your growth with analytics and performance insights.",
    icon: BarChart3,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <section className="bg-primary/5 py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Ace Your Placement
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Practice, assess, and prepare for your dream job
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-primary-hover transition-colors"
            >
              Get Started
            </Link>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map(({ title, description, icon: Icon }) => (
                <div
                  key={title}
                  className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    {title}
                  </h2>
                  <p className="text-gray-600">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Placement Readiness Platform. All rights
          reserved.
        </div>
      </footer>
    </div>
  );
}
