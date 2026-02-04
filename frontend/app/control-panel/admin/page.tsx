"use client";

import {
  Button,
  BellIcon,
  CalendarIcon,
  ClockIcon,
  GridIcon,
  ArrowRightIcon,
} from "@akxr/design-system";

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  badge?: {
    text: string;
    variant: "success" | "warning" | "error";
  };
}

const StatCard = ({ title, value, subtitle, badge }: StatCardProps) => {
  const badgeColors = {
    success: "text-success",
    warning: "text-warning",
    error: "text-error",
  };

  return (
    <div className="bg-bg-card border border-border-default rounded-lg p-5 flex-1">
      <div className="flex items-start justify-between">
        <span className="text-text-muted text-sm">{title}</span>
        {badge && (
          <span className={`text-sm font-medium ${badgeColors[badge.variant]}`}>
            {badge.text}
          </span>
        )}
      </div>
      <div className="mt-2">
        <span className="text-3xl font-bold text-text-primary">{value}</span>
      </div>
      <div className="mt-1">
        <span className="text-text-muted text-sm">{subtitle}</span>
      </div>
    </div>
  );
};

// Request Card Component
interface RequestCardProps {
  name: string;
  requestType: string;
  batchName: string;
  prevDate: string;
  newDate: string;
  isNew?: boolean;
  onAccept?: () => void;
  onReject?: () => void;
  onViewDetails?: () => void;
}

const RequestCard = ({
  name,
  requestType,
  batchName,
  prevDate,
  newDate,
  isNew = false,
  onAccept,
  onReject,
  onViewDetails,
}: RequestCardProps) => {
  return (
    <div className="bg-bg-card border border-border-default rounded-lg p-5 relative">
      {isNew && (
        <div className="absolute top-5 right-5">
          <div className="w-2.5 h-2.5 rounded-full bg-brand" />
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="text-text-muted mt-0.5">
          <BellIcon />
        </div>
        <div className="flex-1">
          <h3 className="text-text-primary font-medium">
            {name} requested: {requestType}
          </h3>
          <p className="text-text-muted text-sm mt-0.5">{batchName}</p>

          <div className="flex items-center gap-4 mt-4">
            <div>
              <span className="text-text-muted text-xs block">Prev Date</span>
              <span className="text-text-primary text-sm font-medium">{prevDate}</span>
            </div>
            <div className="text-text-muted">
              <ArrowRightIcon />
            </div>
            <div>
              <span className="text-text-muted text-xs block">New Date</span>
              <span className="text-text-primary text-sm font-medium">{newDate}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-5">
            <Button variant="primary" size="sm" onClick={onAccept} className="min-w-[120px]">
              Accept
            </Button>
            <Button variant="secondary" size="sm" onClick={onReject} className="min-w-[120px]">
              Reject
            </Button>
            <div className="flex-1" />
            <Button variant="outline" size="sm" onClick={onViewDetails} className="min-w-[120px]">
              View details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Compact Request Row (for collapsed view)
interface CompactRequestProps {
  name: string;
  requestType: string;
}

const CompactRequest = ({ name, requestType }: CompactRequestProps) => {
  return (
    <div className="flex items-center gap-3 px-5 py-3">
      <div className="text-text-muted">
        <BellIcon />
      </div>
      <span className="text-text-primary text-sm">
        {name} requested: {requestType}
      </span>
    </div>
  );
};

// Scheduled Class Card Component
interface ScheduledClassProps {
  title: string;
  time: string;
  batchName: string;
  isLive?: boolean;
  timeRemaining?: string;
  onJoin?: () => void;
}

const ScheduledClassCard = ({
  title,
  time,
  batchName,
  isLive = false,
  timeRemaining,
  onJoin,
}: ScheduledClassProps) => {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border-default last:border-b-0">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="text-text-primary font-medium">{title}</h3>
          {isLive && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-success/20 text-success text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              Live
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 mt-2 text-text-muted text-sm">
          <span className="flex items-center gap-1.5">
            <ClockIcon size={16} />
            {time}
          </span>
          <span className="flex items-center gap-1.5">
            <GridIcon size={16} />
            {batchName}
          </span>
        </div>
      </div>
      <div>
        {isLive ? (
          <Button variant="primary" size="sm" onClick={onJoin}>
            Join now
          </Button>
        ) : timeRemaining ? (
          <Button variant="secondary" size="sm" disabled>
            Time remaining: {timeRemaining}
          </Button>
        ) : null}
      </div>
    </div>
  );
};

// Sidebar Navigation Item
interface NavItemProps {
  active?: boolean;
}

const NavItem = ({ active = false }: NavItemProps) => (
  <div
    className={`w-10 h-10 rounded-md ${active ? "bg-brand" : "bg-brand-muted"
      } cursor-pointer hover:bg-brand-hover transition-colors`}
  />
);

// Main Page Component
export default function AdminDashboard() {
  // Mock data - replace with actual API data
  const userName = "Sarah";
  const stats = {
    totalStudents: 115,
    studentGrowth: "+12% from last month",
    activeBatches: 8,
    avgAttendance: "92%",
  };

  const pendingRequests = [
    {
      id: 1,
      name: "Sarah Chen",
      requestType: "Extend end date by 2 weeks",
      batchName: "Full Stack - Q1 2024",
      prevDate: "12 Jan 2026",
      newDate: "26 Jan 2026",
      isNew: true,
    },
    {
      id: 2,
      name: "Sarah Chen",
      requestType: "Extend end date by 2 weeks",
      batchName: "Full Stack - Q1 2024",
      prevDate: "12 Jan 2026",
      newDate: "26 Jan 2026",
      isNew: true,
    },
  ];

  const collapsedRequests = [
    {
      id: 3,
      name: "Sarah Chen",
      requestType: "Extend end date by 2 weeks",
    },
  ];

  const scheduledClasses = [
    {
      id: 1,
      title: "React Advanced Patterns",
      time: "2:00 PM - 4:00 PM",
      batchName: "Full Stack - Q1 2024",
      isLive: true,
    },
    {
      id: 2,
      title: "React Advanced Patterns",
      time: "2:00 PM - 4:00 PM",
      batchName: "Full Stack - Q1 2024",
      timeRemaining: "1hr 24min",
    },
    {
      id: 3,
      title: "React Advanced Patterns",
      time: "2:00 PM - 4:00 PM",
      batchName: "Full Stack - Q1 2024",
      timeRemaining: "1hr 24min",
    },
  ];

  const selectedDate = "Jan 4, 2026";

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Sidebar */}
      <aside className="w-16 bg-bg-primary border-r border-border-default py-6 flex flex-col items-center gap-3">
        <NavItem active />
        <NavItem />
        <NavItem />
        <NavItem />
        <NavItem />
        <NavItem />
        <div className="flex-1" />
        <NavItem />
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary italic">
            Welcome, {userName}
          </h1>
          <p className="text-text-secondary mt-1">
            Here&apos;s what&apos;s happening with your batches today.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            subtitle="across all batched"
            badge={{ text: stats.studentGrowth, variant: "success" }}
          />
          <StatCard
            title="Active Batches"
            value={stats.activeBatches}
            subtitle="Currently running"
          />
        </div>

        {/* Pending Requests */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Pending requests
          </h2>
          <div className="bg-bg-card/50 rounded-lg overflow-hidden">
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  name={request.name}
                  requestType={request.requestType}
                  batchName={request.batchName}
                  prevDate={request.prevDate}
                  newDate={request.newDate}
                  isNew={request.isNew}
                  onAccept={() => console.log("Accept", request.id)}
                  onReject={() => console.log("Reject", request.id)}
                  onViewDetails={() => console.log("View details", request.id)}
                />
              ))}
            </div>
            {collapsedRequests.map((request) => (
              <CompactRequest
                key={request.id}
                name={request.name}
                requestType={request.requestType}
              />
            ))}
          </div>
        </section>

        {/* Scheduled Classes */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text-primary">
              Scheduled classes
            </h2>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-bg-secondary border border-border-default rounded-lg text-text-primary text-sm hover:border-brand-hover transition-colors">
              <CalendarIcon size={16} />
              {selectedDate}
            </button>
          </div>
          <div className="bg-bg-card border border-border-default rounded-lg px-5">
            {scheduledClasses.map((classItem) => (
              <ScheduledClassCard
                key={classItem.id}
                title={classItem.title}
                time={classItem.time}
                batchName={classItem.batchName}
                isLive={classItem.isLive}
                timeRemaining={classItem.timeRemaining}
                onJoin={() => console.log("Join class", classItem.id)}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
