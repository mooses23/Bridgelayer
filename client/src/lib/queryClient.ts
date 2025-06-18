import { QueryClient, QueryFunction } from "@tanstack/react-query";
import ApiClient from "./apiClient";
import { authInterceptor } from "./auth-interceptor";
import { parseApiResponse, handleAuthError, AuthenticationError } from "./error-handler";

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
  try {
    const res = await authInterceptor.request(url, {
      method,
      body: data ? JSON.stringify(data) : undefined,
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    handleAuthError(error as Error);
    throw error;
  }
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

    try {
      const res = await authInterceptor.get(queryKey[0] as string);

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      return await parseApiResponse<T>(res);
    } catch (error) {
      if (error instanceof AuthenticationError && unauthorizedBehavior === "returnNull") {
        return null;
      }
      
      handleAuthError(error as Error);
      throw error;
    }
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