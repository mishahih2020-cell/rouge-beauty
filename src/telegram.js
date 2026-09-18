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
  if (tg) { tg.ready(); tg.expand(); }
}
