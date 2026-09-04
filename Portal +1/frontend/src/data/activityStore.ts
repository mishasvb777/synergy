export type ActivityType = 'post' | 'article' | 'thanks' | 'news';

export type Community = {
  id: number;
  name: string;
  members: number;
  topic: string;
};

export const ALL_COMMUNITIES: Community[] = [
  { id: 1, name: 'Пароль T1', members: 214, topic: 'Безопасность и доступы' },
  { id: 2, name: 'Маркетинг', members: 96, topic: 'Кампании и бренд' },
  { id: 3, name: 'Охрана труда', members: 143, topic: 'Нормы и инструкции' },
  { id: 4, name: 'Киноклуб', members: 58, topic: 'Культура и досуг' },
  { id: 5, name: 'Конгломерат', members: 77, topic: 'Кросс-доменные инициативы' },
];

const MY_COMMUNITIES_KEY = 'portal_plus1_my_communities';
const defaultMyCommunities = [1, 2, 3];

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadMyCommunityIds(): number[] {
  const stored = readJson<number[] | null>(MY_COMMUNITIES_KEY, null);
  if (!stored || !Array.isArray(stored)) {
    localStorage.setItem(MY_COMMUNITIES_KEY, JSON.stringify(defaultMyCommunities));
    return [...defaultMyCommunities];
  }
  return stored;
}

export function saveMyCommunityIds(ids: number[]) {
  localStorage.setItem(MY_COMMUNITIES_KEY, JSON.stringify(ids));
}

export function joinCommunity(id: number): number[] {
  const ids = loadMyCommunityIds();
  if (ids.includes(id)) return ids;
  const next = [...ids, id];
  saveMyCommunityIds(next);
  return next;
}

export function leaveCommunity(id: number): number[] {
  const next = loadMyCommunityIds().filter((x) => x !== id);
  saveMyCommunityIds(next);
  return next;
}

export function communityById(id: number | null | undefined): Community | undefined {
  if (id == null) return undefined;
  return ALL_COMMUNITIES.find((c) => c.id === id);
}

export function formatRelativeRu(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.floor(diffMs / 60000));
  if (mins < 1) return 'только что';
  if (mins < 60) return `${mins} мин. назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours === 1 ? 'около часа назад' : `около ${hours} ч. назад`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'вчера';
  return `${days} дн. назад`;
}

export function fileToBase64(file: File): Promise<{ base64: string; mime: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const comma = result.indexOf(',');
      const base64 = comma >= 0 ? result.slice(comma + 1) : result;
      resolve({ base64, mime: file.type || 'image/jpeg' });
    };
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
    reader.readAsDataURL(file);
  });
}
