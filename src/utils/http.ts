import axios, { AxiosInstance, AxiosError } from "axios";

export function createHttpClient(baseURL: string, headers: Record<string, string> = {}): AxiosInstance {
  const client = axios.create({ baseURL, headers, timeout: 30000 });

  client.interceptors.response.use(
    (res) => res,
    (err: AxiosError) => {
      const status = err.response?.status;
      const data = err.response?.data as Record<string, unknown> | undefined;
      const message =
        (data?.error as { message?: string })?.message ||
        (data?.message as string) ||
        err.message;
      throw new Error(`[HTTP ${status ?? "ERR"}] ${message}`);
    }
  );

  return client;
}

export function dateRange(days: number): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
}

export function required(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required env var: ${name}`);
  return val;
}

export function optional(name: string): string | undefined {
  return process.env[name] || undefined;
}
