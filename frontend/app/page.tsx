"use client";

import { Button } from "@akxr/design-system";
import { useRouter } from "next/navigation";
import { clearAuthTokens } from "@/lib/utils";

export default function Home() {
  const router = useRouter();

  const handleLogout = () => {
    clearAuthTokens();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-text-primary mb-8">akxr</h1>
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
