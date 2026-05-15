"use client";

import {
    Button,
    ProgressBar,
    ClockIcon,
    BookIcon,
} from "@akxr/design-system";
import type { AdminCourse } from "@akxr/api";

export interface HeroCourseProgressProps {
    course: AdminCourse;
    mentorName: string;
    courseName: string;
    totalModules: number;
    completedModules: number;
    hideImage?: boolean;
}

export function HeroCourseProgress({
    course,
    mentorName,
    courseName,
    totalModules,
    completedModules,
    hideImage = false,
}: HeroCourseProgressProps) {
    const progressPercent =
        totalModules > 0
            ? Math.round((completedModules / totalModules) * 100)
            : 0;

    return (
        <div className="bg-bg-card border border-border-default rounded-xl overflow-hidden flex flex-col md:flex-row">
            {/* Left: course info */}
            <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                <div>
                    <span className="text-brand text-sm font-medium">
                        Course Progress
                    </span>
                    <h2 className="text-xl font-bold text-text-primary mt-1">
                        {course.name}
                    </h2>
                    <p className="text-text-muted text-sm mt-0.5">
                        {courseName} &bull; by {mentorName}
                    </p>
                    <p className="text-text-secondary text-sm mt-3 line-clamp-2">
                        {course.description || "No description available"}
                    </p>
                </div>

                <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-text-muted">Progress</span>
                        <span className="text-text-primary font-medium">
                            {progressPercent}%
                        </span>
                    </div>
                    <ProgressBar value={progressPercent} />

                    <div className="flex items-center justify-between text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                            <BookIcon size={14} />
                            Module {completedModules} of {totalModules}
                        </span>
                        <span className="flex items-center gap-1">
                            <ClockIcon size={14} />
                            {course.time_allotted_in_weeks > 0
                                ? `${course.time_allotted_in_weeks * 60} min remaining`
                                : "45 min remaining"}
                        </span>
                    </div>

                    <Button variant="primary" size="sm" className="mt-2">
                        Start Learning
                    </Button>
                </div>
            </div>

            {/* Right: decorative code image */}
            {!hideImage && (
                <div className="hidden md:flex w-[45%] bg-gradient-to-br from-bg-elevated to-bg-primary items-center justify-center relative overflow-hidden">
                    <pre className="text-[11px] leading-relaxed text-text-muted/60 font-mono p-6 select-none whitespace-pre-wrap">
                        {`import { render } from 'react-dom';
import { BrowserRouter } from 'react-router';

const App = () => (
  <BrowserRouter>
    <Switch>
      <Route path="/login" component={Login} />
      <ProtectedRoute exact={true} path="/" />
      <ProtectedRoute path="/settings" />
      <ProtectedRoute component={Dashboard} />
    </Switch>
  </BrowserRouter>
);

render(
  document.getElementById('root')
);`}
                    </pre>
                </div>
            )}
        </div>
    );
}
