export type RoleCode = 'user' | 'moderator' | 'admin';

export interface AuthUser {
  id: number;
  login: string;
  fullName: string;
  role: RoleCode;
  roleName: string;
}

export interface NewsItem {
  id: number;
  title: string;
  body: string;
  authorId: number;
  authorName: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  commentsCount: number;
  likesCount: number;
  likedByMe: boolean;
}

export interface CommentItem {
  id: number;
  body: string;
  createdAt: string;
  authorName: string;
  authorId: number;
}

export interface NewsDetail extends NewsItem {
  comments: CommentItem[];
}

export interface FeedResponse {
  page: number;
  limit: number;
  total: number;
  items: NewsItem[];
  cached: boolean;
}

export interface MenuItem {
  id: number;
  code: string;
  title: string;
  path: string;
  minRole: string;
  sortOrder: number;
}

export interface AdminUser {
  id: number;
  login: string;
  fullName: string;
  isActive: boolean;
  role: RoleCode;
  roleName: string;
  createdAt: string;
}

export interface RoleItem {
  id: number;
  code: RoleCode;
  name: string;
}

export type ActivityType = 'post' | 'article' | 'thanks' | 'news';

export interface ActivityPost {
  id: number;
  title: string;
  body: string;
  type: ActivityType;
  communityId: number | null;
  authorId: number;
  authorName: string;
  createdAt: string;
  hasImage: boolean;
  imageUrl: string | null;
}
