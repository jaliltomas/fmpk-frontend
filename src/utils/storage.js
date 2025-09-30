const STORAGE_KEY = 'fmpk_sessions';

export function loadSessions() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (error) {
    console.warn('No se pudieron cargar las sesiones desde localStorage', error);
    return [];
  }
}

export function saveSessions(sessions) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('No se pudieron guardar las sesiones', error);
  }
}

export function generateSessionId() {
  return `sesion-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
