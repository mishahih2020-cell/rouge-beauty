export function getTelegramUser() {
  const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
  const user = tg?.initDataUnsafe?.user;
  if (user?.id) {
    return { id: String(user.id), name: [user.first_name, user.last_name].filter(Boolean).join(' ') };
  }
  return { id: 'demo-user', name: 'Гостья' };
}

// Методы вроде requestFullscreen/disableVerticalSwipes появились в новых версиях
// Bot API и синхронно бросают WebAppMethodUnsupported на старых клиентах —
// без try/catch это останавливает main.jsx ещё до React-рендера (пустой экран).
function safeCall(tg, method) {
  try { tg[method]?.(); } catch { /* метод не поддерживается этой версией клиента */ }
}

export function initTelegram() {
  const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
  if (!tg) return;
  safeCall(tg, 'ready');
  safeCall(tg, 'expand');
  // Разворачивает приложение на весь экран сразу, без ручного свайпа шторки —
  // но поддерживается не всеми клиентами, отсюда safeCall.
  safeCall(tg, 'requestFullscreen');
  safeCall(tg, 'disableVerticalSwipes');
}
