# ROUGE Beauty — Telegram Mini App для салона красоты

Фронтенд: React + Vite. Бэкенд: свой Node.js/Express-сервер (папка `server/`), хранит данные в JSON-файле — без внешних сервисов вроде n8n или Netlify.

## Разработка

Нужны два процесса: бэкенд и фронтенд.

```bash
# 1. Бэкенд
cd server
npm install
cp .env.example .env   # при необходимости поменяйте ADMIN_TELEGRAM_ID
npm run dev            # слушает на http://localhost:8787

# 2. Фронтенд (в другом терминале, из корня репозитория)
npm install
npm run dev             # http://localhost:5173, ходит на бэкенд по localhost:8787
```

## Продакшн (свой сервер, без Netlify)

Один Node-процесс отдаёт и API, и собранный фронтенд:

```bash
# из корня репозитория
npm install
npm run build            # соберёт фронтенд в dist/

cd server
npm install
cp .env.example .env     # укажите ADMIN_TELEGRAM_ID
npm start                # слушает на PORT (по умолчанию 8787), отдаёт dist/ и /api/*
```

Дальше — reverse proxy (nginx/caddy) с HTTPS на этот порт, и полученный домен указывается как Web App URL в BotFather. Процесс держите живым через `pm2`/`systemd`/Docker — как удобнее на вашем сервере.

## Структура

- `src/pages` — экраны приложения (Главная, Услуги, Мастера, Запись, Мои записи, Профиль, Акции)
- `src/pages/admin` — админ-панель владельца (`/admin`, доступ по Telegram ID)
- `src/components` — переиспользуемые UI-компоненты
- `src/api.js` — все запросы к своему backend (`server/`)
- `src/telegram.js` — интеграция с Telegram WebApp SDK
- `server/` — Express API + раздача собранного фронтенда, данные в `server/data/db.json`

## Backend

Свой сервер на Express (`server/src`), роуты под `/api/salon/*` — тот же контракт, что раньше был в n8n (услуги, мастера, акции, доступность слотов, записи, профиль, админ-CRUD). Хранилище — JSON-файл `server/data/db.json` (создаётся и сидируется данными при первом запуске, в git не попадает).

Доступ в `/admin` даётся по Telegram ID, заданному в `server/.env` (`ADMIN_TELEGRAM_ID`, по умолчанию `8419316772` — тот же ID, что зашит во фронтенде в `src/pages/Profile.jsx`).
