"use client";

import { useGetUser } from "@akxr/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@akxr/design-system";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { MentorDashboard } from "@/components/dashboard/MentorDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";

export default function Home() {
  const router = useRouter();
  const { data, isLoading, isError } = useGetUser();

  useEffect(() => {
    if (isError) router.push("/login");
  }, [isError, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-text-muted">
          <Spinner size="lg" />
          <p className="text-[13px]">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const user = data?.status === 200 ? data.data.data : undefined;
  if (!user) return null;

  if (user.profile_status === "AUTHENTICATED") {
    router.push("/complete-profile");
    return null;
  }

  if (user.role === "MENTOR") return <MentorDashboard user={user} />;
  if (user.role === "ADMIN") return <AdminDashboard user={user} />;
  return <StudentDashboard user={user} />;
}
