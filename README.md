# ROUGE Beauty — Telegram Mini App для салона красоты

Фронтенд: React + Vite. Бэкенд: n8n (webhook API + Data Tables). Хостинг: Netlify.

## Разработка

```bash
npm install
npm run dev
```

## Сборка

```bash
npm run build
```

Собранные файлы появятся в папке `dist/` — их нужно задеплоить на Netlify (или другой статический хостинг).

## Структура

- `src/pages` — экраны приложения (Главная, Услуги, Мастера, Запись, Мои записи, Профиль, Акции)
- `src/pages/admin` — админ-панель владельца (`/admin`, доступ по Telegram ID)
- `src/components` — переиспользуемые UI-компоненты
- `src/api.js` — все запросы к n8n backend
- `src/telegram.js` — интеграция с Telegram WebApp SDK

## Backend

API живёт в n8n: `https://dnaoedi5ks.app.n8n.cloud/webhook/salon/*`
