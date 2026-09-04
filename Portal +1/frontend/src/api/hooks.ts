import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import type {
  ActivityPost,
  ActivityType,
  AdminUser,
  FeedResponse,
  MenuItem,
  NewsDetail,
  NewsItem,
  RoleCode,
  RoleItem,
} from '../types';

export function useFeed() {
  return useQuery({
    queryKey: ['feed'],
    queryFn: () => api<FeedResponse>('/news?page=1&limit=10'),
  });
}

export function useNews(id: number) {
  return useQuery({
    queryKey: ['news', id],
    queryFn: () => api<NewsDetail>(`/news/${id}`),
    enabled: Number.isFinite(id),
  });
}

export function useMenu() {
  return useQuery({
    queryKey: ['menu'],
    queryFn: () => api<{ items: MenuItem[] }>('/menu').then((r) => r.items),
  });
}

export function useActivityFeed() {
  return useQuery({
    queryKey: ['activity'],
    queryFn: () => api<{ items: ActivityPost[] }>('/activity').then((r) => r.items),
  });
}

export function useActivityPost(id: number) {
  return useQuery({
    queryKey: ['activity', id],
    queryFn: () => api<ActivityPost>(`/activity/${id}`),
    enabled: Number.isFinite(id),
  });
}

export function useCreateActivityPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      title: string;
      body: string;
      type: ActivityType;
      communityId: number | null;
      imageBase64?: string | null;
      imageMime?: string | null;
    }) => api<ActivityPost>('/activity', { method: 'POST', body: payload }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['activity'] });
    },
  });
}

export function useNewsManage() {
  return useQuery({
    queryKey: ['news-manage'],
    queryFn: () => api<{ items: NewsItem[] }>('/news/manage').then((r) => r.items),
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api<{ items: AdminUser[] }>('/admin/users').then((r) => r.items),
  });
}

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => api<{ items: RoleItem[] }>('/admin/roles').then((r) => r.items),
  });
}

export function useToggleLike(newsId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api<{ liked: boolean; likesCount: number }>(`/news/${newsId}/reactions/like`, {
        method: 'POST',
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['news', newsId] });
      void qc.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

export function useAddComment(newsId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) =>
      api(`/news/${newsId}/comments`, { method: 'POST', body: { body } }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['news', newsId] });
      void qc.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

export function useSaveNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      id?: number;
      title: string;
      body: string;
      isPublished: boolean;
    }) => {
      if (payload.id) {
        return api(`/news/${payload.id}`, {
          method: 'PUT',
          body: {
            title: payload.title,
            body: payload.body,
            isPublished: payload.isPublished,
          },
        });
      }
      return api('/news', {
        method: 'POST',
        body: {
          title: payload.title,
          body: payload.body,
          isPublished: payload.isPublished,
        },
      });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['news-manage'] });
      void qc.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

export function useChangeRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: number; role: RoleCode }) =>
      api(`/admin/users/${id}/role`, { method: 'PATCH', body: { role } }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}

export function useToggleActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      api(`/admin/users/${id}/active`, { method: 'PATCH', body: { isActive } }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { login: string; password: string; fullName: string; role: RoleCode }) =>
      api('/admin/users', { method: 'POST', body: payload }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}
