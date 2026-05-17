import type { QueryClient } from "@tanstack/react-query";

/** Cancel stale pre-login requests and reset cached API errors after login. */
export async function resetAuthQueries(queryClient: QueryClient) {
  await queryClient.cancelQueries();
  queryClient.removeQueries();
}
