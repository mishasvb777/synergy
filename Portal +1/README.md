# Портал+1 (MVP)

Учебное многопользовательское веб-приложение корпоративного портала для ВКР
(тема: разработка на примере ГК «Иннотех»).

## Стек

- **Frontend:** React + TypeScript + Vite + Material UI + Redux Toolkit + React Query
- **Backend:** Node.js + TypeScript + Express + JWT
- **СУБД:** PostgreSQL (Docker) или встроенный PGlite
- **Кэш:** Redis (Docker) или in-memory fallback

## Быстрый старт (локально без Docker)

```bash
cd portal-plus1/backend
npm install
npm run db:init
npm run dev

# другой терминал
cd portal-plus1/frontend
npm install
npm run dev
```

Открыть: http://localhost:5173

В `.env` backend по умолчанию: `USE_PGLITE=1`, `SKIP_REDIS=1`.

## С Docker (PostgreSQL + Redis)

```bash
cd portal-plus1
docker compose up -d
# в backend/.env: USE_PGLITE=0, SKIP_REDIS=0,
# DATABASE_URL=postgresql://portal:portal@localhost:5432/portal_plus1
cd backend && npm run db:init && npm run dev
cd ../frontend && npm run dev
```

## Демо-учётные записи

Пароль для всех: `Password123!`

| Логин | Роль |
|-------|------|
| employee | Пользователь |
| moderator | Модератор |
| admin | Администратор |

## Скрипты

- Backend: `npm run dev` · `npm run db:init` · `npm run typecheck`
- Frontend: `npm run dev` · `npm run build` · `npm run typecheck`
