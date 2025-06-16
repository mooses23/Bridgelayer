import { QueryClient, QueryFunction } from "@tanstack/react-query";
import ApiClient from "./apiClient";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let text;
    try {
      text = await res.text();
    } catch (error) {
      text = res.statusText || 'Unknown error';
    }
    throw new Error(`${res.status}: ${text || 'Request failed'}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await ApiClient.fetch(url, {
    method,
    body: data ? JSON.stringify(data) : undefined,
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Add defensive check for queryKey
    if (!queryKey || !queryKey[0] || typeof queryKey[0] !== 'string') {
      throw new Error('Invalid query key provided');
    }

    const res = await ApiClient.get(queryKey[0] as string);

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});