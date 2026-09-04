import type { AuthUser } from '../types';
import { locale } from '../locale';

const TOKEN_KEY = 'portal_plus1_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function api<T>(
  path: string,
  options: Omit<RequestInit, 'body'> & { body?: unknown } = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const { body, ...rest } = options;
  const res = await fetch(`/api${path}`, {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = (await res.json().catch(() => ({}))) as { error?: string } & T;
  if (!res.ok) {
    throw new ApiError(data.error || locale.common.requestError, res.status);
  }
  return data;
}

export const authApi = {
  login: (login: string, password: string) =>
    api<{ token: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: { login, password },
    }),
  me: () => api<AuthUser>('/auth/me'),
  register: (payload: {
    login: string;
    email: string;
    fullName: string;
    password: string;
  }) =>
    api<{
      ok: boolean;
      message: string;
      email: string;
      confirmUrl?: string;
      previewUrl?: string;
      mailMode?: string;
    }>('/auth/register', { method: 'POST', body: payload }),
  confirmEmail: (token: string) =>
    api<{ ok: boolean; message: string; alreadyVerified?: boolean }>(
      `/auth/confirm-email?token=${encodeURIComponent(token)}`
    ),
  resendConfirmation: (email: string) =>
    api<{ ok: boolean; message: string; confirmUrl?: string; previewUrl?: string }>(
      '/auth/resend-confirmation',
      { method: 'POST', body: { email } }
    ),
};
