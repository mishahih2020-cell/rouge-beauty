export function getTelegramUser() {
  const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
  const user = tg?.initDataUnsafe?.user;
  if (user?.id) {
    return { id: String(user.id), name: [user.first_name, user.last_name].filter(Boolean).join(' ') };
  }
  return { id: 'demo-user', name: 'Гостья' };
}

export function initTelegram() {
  const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
  if (!tg) return;
  tg.ready();
  tg.expand();
  // Без requestFullscreen приложение открывается свёрнутым в шторку —
  // пользователю приходится вручную дотягивать её вверх, чтобы увидеть контент.
  tg.requestFullscreen?.();
  tg.disableVerticalSwipes?.();
}
