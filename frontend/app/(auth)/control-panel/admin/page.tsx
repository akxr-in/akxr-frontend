"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  BellIcon,
  CalendarIcon,
  ClockIcon,
  GridIcon,
  ArrowRightIcon,
  Spinner,
} from "@akxr/design-system";
import { useGetUser, useGetAdminUsers, useGetBatch, useGetMeeting } from "@akxr/api";
import { SidebarNav } from "../../../../components/SidebarNav";

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
    <div className="bg-brand-muted/40 p-5 relative">
      {isNew && (
        <div className="absolute top-5 right-5">
          <div className="w-2.5 h-2.5 rounded-full bg-brand" />
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="text-text-muted mt-0.5">
          <BellIcon />
        </div>
        <div className="flex-1 flex flex-col gap-3">
          <div>
            <h3 className="text-text-primary font-medium">
              {name} requested: {requestType}
            </h3>
            <p className="text-text-muted text-sm">{batchName}</p>
          </div>

          <div className="flex items-center gap-4">
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

          <div className="flex items-center gap-3">
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
    <div className="flex items-center gap-3 px-5 py-3 bg-bg-muted border-t border-border-default">
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

// Main Page Component
export default function AdminDashboard() {
  const router = useRouter();

  // Real API data
  const { data: userData, isLoading: isLoadingUser } = useGetUser();
  const { data: usersData } = useGetAdminUsers();
  const { data: batchesData } = useGetBatch();
  const { data: meetingsData } = useGetMeeting();

  const user = userData?.status === 200 ? userData.data.data : null;
  const userName = user?.full_name?.split(" ")[0] ?? "Admin";

  // Compute stats from real data
  const totalStudents = useMemo(() => {
    if (usersData?.status === 200 && Array.isArray(usersData.data?.data)) {
      return usersData.data.data.filter((u) => u.role === "STUDENT").length;
    }
    return 0;
  }, [usersData]);

  const activeBatches = useMemo(() => {
    if (batchesData?.status === 200 && Array.isArray(batchesData.data?.data)) {
      return batchesData.data.data.length;
    }
    return 0;
  }, [batchesData]);

  // Build batch name lookup: batch_id → batch_name
  const batchNameMap = useMemo(() => {
    const map = new Map<string, string>();
    if (batchesData?.status === 200 && Array.isArray(batchesData.data?.data)) {
      for (const b of batchesData.data.data) {
        map.set(b.id, b.batch_name);
      }
    }
    return map;
  }, [batchesData]);

  // Build scheduled classes from real meetings, sorted by start time
  const scheduledClasses = useMemo(() => {
    if (meetingsData?.status === 200 && Array.isArray(meetingsData.data?.data)) {
      const now = new Date();
      const meetings = meetingsData.data.data as Record<string, unknown>[];

      return meetings
        .filter((m) => {
          // If the API has a status field, skip ENDED/CANCELLED; otherwise show all
          const status = m.status as string | undefined;
          if (status === "ENDED" || status === "CANCELLED") return false;
          return true;
        })
        .sort(
          (a, b) =>
            new Date(a.scheduled_start_time as string).getTime() -
            new Date(b.scheduled_start_time as string).getTime()
        )
        .map((m) => {
          const start = new Date(m.scheduled_start_time as string);
          // Use scheduled_end_time if available, otherwise fall back to duration_minutes
          const end = m.scheduled_end_time
            ? new Date(m.scheduled_end_time as string)
            : new Date(
              start.getTime() +
              ((m.duration_minutes as number) || 60) * 60_000
            );

          const isLive =
            (m.status as string) === "STARTED" ||
            (start <= now && end > now);

          // Calculate time remaining for upcoming meetings
          let timeRemaining: string | undefined;
          if (!isLive && start > now) {
            const diffMs = start.getTime() - now.getTime();
            const diffHrs = Math.floor(diffMs / 3_600_000);
            const diffMins = Math.floor((diffMs % 3_600_000) / 60_000);
            timeRemaining =
              diffHrs > 0 ? `${diffHrs}hr ${diffMins}min` : `${diffMins}min`;
          }

          const formatTime = (d: Date) =>
            d.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            });

          return {
            id: m.id as string,
            rtkRoomId: (m.realtime_kit_room_id as string | undefined) ?? "",
            title: (m.title as string) || "Untitled Meeting",
            time: `${formatTime(start)} - ${formatTime(end)}`,
            batchName:
              batchNameMap.get(m.batch_id as string) ?? "Unknown Batch",
            isLive,
            timeRemaining,
          };
        });
    }
    return [];
  }, [meetingsData, batchNameMap]);

  // Dummy data — no backend API available for these
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

  const selectedDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const INITIAL_CLASSES_SHOWN = 3;
  const [showAllClasses, setShowAllClasses] = useState(false);
  const visibleClasses = showAllClasses
    ? scheduledClasses
    : scheduledClasses.slice(0, INITIAL_CLASSES_SHOWN);
  const hasMoreClasses = scheduledClasses.length > INITIAL_CLASSES_SHOWN;

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-bg-primary flex">
        <SidebarNav activeIndex={0} />
        <main className="flex-1 flex items-center justify-center">
          <Spinner size="lg" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Sidebar */}
      <SidebarNav activeIndex={0} />

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
            value={totalStudents}
            subtitle="across all batches"
          />
          <StatCard
            title="Active Batches"
            value={activeBatches}
            subtitle="Currently running"
          />
        </div>

        {/* Pending Requests */}
        {/* <section className="mb-8">
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Pending requests
          </h2>
          <div className="bg-bg-card rounded-lg overflow-hidden border border-border-default">
            <div className="divide-y divide-border-default">
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
        </section> */}

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
            {scheduledClasses.length === 0 ? (
              <div className="py-8 text-center text-text-muted text-sm">
                No upcoming or live classes
              </div>
            ) : (
              visibleClasses.map((classItem) => (
                <ScheduledClassCard
                  key={classItem.id}
                  title={classItem.title}
                  time={classItem.time}
                  batchName={classItem.batchName}
                  isLive={classItem.isLive}
                  timeRemaining={classItem.timeRemaining}
                  onJoin={() => classItem.rtkRoomId ? router.push(`/meet/${classItem.rtkRoomId}`) : undefined}
                />
              ))
            )}
          </div>
          {hasMoreClasses && (
            <button
              onClick={() => setShowAllClasses((prev) => !prev)}
              className="mt-3 w-full py-2.5 text-sm font-medium text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              {showAllClasses
                ? "Show less"
                : `View ${scheduledClasses.length - INITIAL_CLASSES_SHOWN} more classes`}
            </button>
          )}
        </section>
      </main>
    </div>
  );
}
