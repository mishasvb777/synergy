export const feed = {
  title: 'Новости',
  greeting: (name: string) => `Привет, ${name}!`,
  companyNews: 'Новости компании',
  allNews: 'Все новости',
  publications: (total: number) => `${total} публикаций`,
  cachedSuffix: ' · кэш',
  reactions: (count: number) => `${count}`,
  comments: (count: number) => `${count}`,
  views: (count: number) => `${count}`,
  mostDiscussed: 'Самые обсуждаемые',
  mostLiked: 'Самые понравившиеся',
  categoryDefault: 'Корпоративный портал',
} as const;
