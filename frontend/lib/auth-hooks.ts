"use client";

import { useEffect, useState } from "react";
import type { UseQueryOptions } from "@tanstack/react-query";
import {
  getGetUserQueryKey,
  hasAuthToken,
  useGetUser,
  type getUser,
} from "@akxr/api";

export { getGetUserQueryKey };

export function useHasAuthToken(): boolean {
  const [tokenPresent, setTokenPresent] = useState(
    () => typeof window !== "undefined" && hasAuthToken(),
  );

  useEffect(() => {
    setTokenPresent(hasAuthToken());
  }, []);

  return tokenPresent;
}

type GetUserResult = Awaited<ReturnType<typeof getUser>>;

/** Fetch /user only when an access token is present (avoids 401s on public pages). */
export function useAuthenticatedUser<TData = GetUserResult>(
  options?: {
    query?: Partial<UseQueryOptions<GetUserResult, Error, TData>>;
    request?: Parameters<typeof useGetUser>[0] extends { request?: infer R } ? R : never;
  },
) {
  const tokenPresent = useHasAuthToken();

  return useGetUser<TData, Error>({
    ...options,
    query: {
      ...options?.query,
      enabled: tokenPresent && (options?.query?.enabled ?? true),
    },
  });
}
