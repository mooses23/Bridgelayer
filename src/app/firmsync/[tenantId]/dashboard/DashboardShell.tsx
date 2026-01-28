"use client";

import { useMemo, useState } from "react";
import PortalRenderer from "@/components/PortalRenderer";
import type { PortalPageConfiguration } from "@/types";

interface DashboardShellProps {
  configuration: PortalPageConfiguration | null;
}

const baseStats = [
  {
    title: "Active Cases",
    value: "24",
    change: "+3",
    changeType: "increase" as const,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    ),
  },
  {
    title: "New Clients",
    value: "8",
    change: "+2",
    changeType: "increase" as const,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
        />
      </svg>
    ),
  },
  {
    title: "Revenue (MTD)",
    value: "$42,500",
    change: "+12%",
    changeType: "increase" as const,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    title: "Billable Hours",
    value: "156.5",
    change: "-5%",
    changeType: "decrease" as const,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
];

const recentActivities = [
  { type: "case", message: "New case filed: Smith vs. Johnson", time: "2 hours ago", urgent: false },
  { type: "client", message: "Client meeting scheduled for tomorrow", time: "4 hours ago", urgent: true },
  { type: "document", message: "Contract signed: ABC Corp Agreement", time: "6 hours ago", urgent: false },
  { type: "billing", message: "Invoice #1234 sent to client", time: "1 day ago", urgent: false },
  { type: "calendar", message: "Court hearing reminder for Friday", time: "1 day ago", urgent: true },
];

const upcomingDeadlines = [
  { case: "Smith vs. Johnson", task: "File motion to dismiss", due: "2 days", priority: "high" },
  { case: "ABC Corp Merger", task: "Due diligence report", due: "5 days", priority: "medium" },
  { case: "Estate Planning - Doe", task: "Will execution", due: "1 week", priority: "low" },
  { case: "Personal Injury - Wilson", task: "Medical records review", due: "2 weeks", priority: "medium" },
];

type ActionColor = "blue" | "green" | "purple" | "yellow";

const actionVariants: Record<ActionColor, string> = {
  blue: "hover:border-blue-300 hover:bg-blue-50",
  green: "hover:border-green-300 hover:bg-green-50",
  purple: "hover:border-purple-300 hover:bg-purple-50",
  yellow: "hover:border-yellow-300 hover:bg-yellow-50",
};

const quickActions: { label: string; color: ActionColor }[] = [
  { label: "New Case", color: "blue" },
  { label: "Add Client", color: "green" },
  { label: "Create Invoice", color: "purple" },
  { label: "Schedule", color: "yellow" },
];

export default function DashboardShell({ configuration }: DashboardShellProps) {
  const [timeFrame, setTimeFrame] = useState("week");

  const stats = useMemo(() => baseStats, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-blue-600">Firm overview</p>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Snapshot of case load, revenue, and key workflows.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={timeFrame}
              onChange={(e) => setTimeFrame(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Select metric timeframe"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
            <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
              </svg>
              New Case
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">{stat.value}</p>
                  <p
                    className={`mt-1 text-sm font-medium ${
                      stat.changeType === "increase" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stat.change}
                    <span className="text-gray-500"> vs last {timeFrame}</span>
                  </p>
                </div>
                <div
                  className={`rounded-xl p-3 ${
                    stat.changeType === "increase" ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
                  }`}
                >
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Portal layout</h2>
              <p className="text-sm text-gray-500">Powered by the admin layout builder</p>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">Beta</span>
          </div>
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6">
            {configuration ? (
              <PortalRenderer configuration={configuration} />
            ) : (
              <div className="rounded-xl bg-gray-50 p-10 text-center text-gray-600">
                <p className="font-medium text-gray-900">No dashboard layout configured yet</p>
                <p className="mt-2 text-sm text-gray-500">
                  Build a layout in the FirmSync Admin Workshop to populate this section automatically.
                </p>
              </div>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-4">
                <h3 className="text-base font-semibold text-gray-900">Recent activity</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4 px-6 py-4">
                    <div
                      className={`rounded-lg p-2 ${
                        activity.type === "case"
                          ? "bg-blue-50 text-blue-600"
                          : activity.type === "client"
                          ? "bg-green-50 text-green-600"
                          : activity.type === "document"
                          ? "bg-purple-50 text-purple-600"
                          : activity.type === "billing"
                          ? "bg-yellow-50 text-yellow-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                    {activity.urgent && (
                      <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-600">Urgent</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">Quick actions</h3>
                <p className="text-xs text-gray-500">Frequently used workflows</p>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    className={`rounded-xl border border-gray-200 p-4 text-center text-sm font-semibold text-gray-700 transition ${actionVariants[action.color]}`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-4">
                <h3 className="text-base font-semibold text-gray-900">Upcoming deadlines</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {upcomingDeadlines.map((deadline, index) => (
                  <div key={index} className="px-6 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{deadline.case}</p>
                        <p className="text-sm text-gray-500">{deadline.task}</p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          deadline.priority === "high"
                            ? "bg-red-50 text-red-600"
                            : deadline.priority === "medium"
                            ? "bg-yellow-50 text-yellow-600"
                            : "bg-green-50 text-green-600"
                        }`}
                      >
                        {deadline.priority}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Due in {deadline.due}</p>
                  </div>
                ))}
              </div>
              <button className="w-full rounded-b-2xl border-t border-gray-100 px-6 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50">
                View all deadlines
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
