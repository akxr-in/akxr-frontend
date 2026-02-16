"use client";

import {
  Button,
  CalendarIcon,
  UsersIcon,
  CheckCircleIcon,
  Chip,
  ProgressBar,
} from "@akxr/design-system";
import type { GetBatch200DataItem } from "@akxr/api";

export type BatchStatus = "to_be_started" | "ongoing" | "completed";

export interface BatchCardProps {
  batch: GetBatch200DataItem;
  /** @default "View details" */
  actionLabel?: string;
  /** Disable the action button */
  actionDisabled?: boolean;
  onAction?: () => void;
  /** @deprecated Use onAction instead */
  onViewDetails?: () => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getBatchStatus(
  startDate: string,
  endDate: string | null
): BatchStatus {
  const now = new Date();
  const start = new Date(startDate);

  if (!endDate) {
    return now >= start ? "ongoing" : "to_be_started";
  }

  const end = new Date(endDate);

  if (now < start) {
    return "to_be_started";
  } else if (now >= start && now <= end) {
    return "ongoing";
  } else {
    return "completed";
  }
}

function calculateCourseProgress(
  completedCourseIds: string[],
  courseIds: string[]
): number {
  if (courseIds.length === 0) return 0;
  return Math.round((completedCourseIds.length / courseIds.length) * 100);
}

export const BatchCard = ({ batch, actionLabel = "View details", actionDisabled, onAction, onViewDetails }: BatchCardProps) => {
  const status = getBatchStatus(batch.batch_start_date, batch.batch_end_date);
  const name = batch.batch_name;
  const courseProgress = calculateCourseProgress(
    batch.completed_course_ids,
    batch.course_ids
  );
  const studentsEnrolled = 0; // TODO: hook up real value when backend provides it
  const mentorName =
    batch.mentor_ids.length > 0
      ? `Mentor ${batch.mentor_ids[0].slice(0, 8)}`
      : "No mentor assigned";
  const description = batch.description || "No description available";
  const startDate = formatDate(batch.batch_start_date);
  const endDate = batch.batch_end_date
    ? formatDate(batch.batch_end_date)
    : "TBD";
  const seatsAvailable = status === "to_be_started";
  const attendance = status !== "to_be_started" ? undefined : undefined; // placeholder

  const isOngoingOrCompleted = status === "ongoing" || status === "completed";
  const progressValue = courseProgress ?? (studentsEnrolled / 30) * 100;

  return (
    <div className="bg-bg-card border border-border-default rounded-lg p-5 flex flex-col">
      {/* Status Chip */}
      <div className="mb-3">
        {status === "to_be_started" && (
          <Chip variant="neutral" className="text-xs py-1 px-2.5">
            To be started
          </Chip>
        )}
        {status === "ongoing" && (
          <Chip variant="warning" className="text-xs py-1 px-2.5">
            Ongoing
          </Chip>
        )}
        {status === "completed" && (
          <Chip variant="success" className="text-xs py-1 px-2.5">
            Completed
          </Chip>
        )}
      </div>

      {/* Title & Mentor */}
      <h3 className="text-lg font-semibold text-text-primary">{name}</h3>
      <p className="text-text-muted text-sm mt-0.5">by {mentorName}</p>

      {/* Description */}
      <p className="text-text-secondary text-sm mt-3 line-clamp-3 flex-1">
        {description}
      </p>

      {/* Stats Section - varies by status */}
      <div className="mt-4 space-y-3">
        {isOngoingOrCompleted ? (
          <>
            {/* Students & Attendance Row */}
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-text-muted">
                <UsersIcon size={16} />
                Students enrolled: {studentsEnrolled}
              </span>
              {attendance !== undefined && (
                <span className="text-brand font-medium">
                  Attendance: {attendance}%
                </span>
              )}
            </div>

            {/* Course Progress */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Course progress</span>
                <span className="text-text-primary">{courseProgress}%</span>
              </div>
              <ProgressBar
                value={courseProgress ?? 0}
                variant={status === "completed" ? "success" : "brand"}
              />
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-1.5 text-text-muted text-sm">
              <CalendarIcon size={16} />
              {startDate} - {endDate}
            </div>
          </>
        ) : (
          <>
            {/* Date Range for "To be started" */}
            <div className="flex items-center gap-1.5 text-text-muted text-sm">
              <CalendarIcon size={16} />
              {startDate} - {endDate}
            </div>

            {/* Students & Seats Row */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">
                {studentsEnrolled} Students enrolled
              </span>
              {seatsAvailable && (
                <span className="flex items-center gap-1.5 text-success">
                  <CheckCircleIcon size={16} />
                  Seats Available
                </span>
              )}
            </div>

            {/* Progress Bar */}
            <ProgressBar value={progressValue} />
          </>
        )}
      </div>

      {/* Action Button */}
      <Button
        variant="outline"
        size="sm"
        className="w-full mt-5"
        onClick={onAction ?? onViewDetails}
        disabled={actionDisabled}
      >
        {actionLabel}
      </Button>
    </div>
  );
};

