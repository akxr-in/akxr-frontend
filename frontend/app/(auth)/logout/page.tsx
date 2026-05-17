"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearAuthTokens } from "@/lib/utils";
import { dc } from "@/lib/dc";
import { Spinner } from "@akxr/design-system";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    void dc.endSession().finally(() => {
      clearAuthTokens();
      router.replace("/login");
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="text-center">
        <Spinner size="lg" className="mx-auto mb-4" />
        <p className="text-text-secondary">Logging you out...</p>
      </div>
    </div>
  );
}

