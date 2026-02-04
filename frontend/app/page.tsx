"use client";

import { Button, Spinner } from "@akxr/design-system";
import { useRouter } from "next/navigation";
import { clearAuthTokens } from "@/lib/utils";
import { useGetUser } from "@akxr/api";

export default function Home() {
  const router = useRouter();
  const { data, isLoading, error } = useGetUser();

  const handleLogout = () => {
    clearAuthTokens();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-text-secondary">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text-primary mb-4">akxr</h1>
          <p className="text-error mb-4">Failed to load user data</p>
          <Button
            type="button"
            variant="outline"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>
    );
  }

  const user = data?.status === 200 ? data.data.data : null;

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-bg-card border border-border-default rounded-lg p-6">
          <div className="flex items-start justify-between mb-6">
            <h1 className="text-3xl font-bold text-text-primary">akxr</h1>
            <Button
              type="button"
              variant="outline"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>

          {user && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-text-primary mb-4">
                  User Profile
                </h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-text-muted text-sm">Full Name:</span>
                    <p className="text-text-primary font-medium">{user.full_name}</p>
                  </div>
                  <div>
                    <span className="text-text-muted text-sm">Email:</span>
                    <p className="text-text-primary font-medium">{user.email}</p>
                  </div>
                  <div>
                    <span className="text-text-muted text-sm">Username:</span>
                    <p className="text-text-primary font-medium">{user.username}</p>
                  </div>
                  <div>
                    <span className="text-text-muted text-sm">Role:</span>
                    <p className="text-text-primary font-medium capitalize">{user.role}</p>
                  </div>
                  <div>
                    <span className="text-text-muted text-sm">Profile Status:</span>
                    <p className="text-text-primary font-medium capitalize">
                      {user.profile_status.replace(/_/g, " ")}
                    </p>
                  </div>
                  {user.skills && user.skills.length > 0 && (
                    <div>
                      <span className="text-text-muted text-sm">Skills:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {user.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-bg-elevated rounded text-sm text-text-primary"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(user.github_url || user.linkedin_url || user.x_url) && (
                    <div>
                      <span className="text-text-muted text-sm">Social Links:</span>
                      <div className="flex flex-wrap gap-4 mt-1">
                        {user.github_url && (
                          <a
                            href={user.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand hover:text-brand-hover text-sm"
                          >
                            GitHub
                          </a>
                        )}
                        {user.linkedin_url && (
                          <a
                            href={user.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand hover:text-brand-hover text-sm"
                          >
                            LinkedIn
                          </a>
                        )}
                        {user.x_url && (
                          <a
                            href={user.x_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand hover:text-brand-hover text-sm"
                          >
                            X (Twitter)
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                  {user.college_year && (
                    <div>
                      <span className="text-text-muted text-sm">College Year:</span>
                      <p className="text-text-primary font-medium">{user.college_year}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-text-muted text-sm">Did Internship:</span>
                    <p className="text-text-primary font-medium">
                      {user.did_internship ? "Yes" : "No"}
                    </p>
                  </div>
                  {user.batch_ids && user.batch_ids.length > 0 && (
                    <div>
                      <span className="text-text-muted text-sm">Batches:</span>
                      <p className="text-text-primary font-medium">
                        {user.batch_ids.length} batch(es)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
