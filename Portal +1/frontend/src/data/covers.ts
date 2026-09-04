export const newsCovers = [
  '/covers/panda-hike.png',
  '/covers/panda-office.png',
  '/covers/panda-events.png',
  '/covers/panda-academy.png',
  '/covers/panda-gift.png',
  '/covers/panda-knowledge.png',
] as const;

export function coverForId(id: number): string {
  return newsCovers[Math.abs(id) % newsCovers.length];
}

export function coverForIndex(index: number): string {
  return newsCovers[Math.abs(index) % newsCovers.length];
}
