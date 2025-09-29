<template>
  <section class="space-y-8">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <article class="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
        <h2 class="text-sm font-medium text-slate-500">Sesiones creadas</h2>
        <p class="mt-3 text-3xl font-semibold text-slate-800">{{ totalSessions }}</p>
        <p class="mt-1 text-sm text-slate-500">Total de sesiones registradas en FMPK.</p>
      </article>
      <article class="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
        <h2 class="text-sm font-medium text-slate-500">Participantes</h2>
        <p class="mt-3 text-3xl font-semibold text-slate-800">{{ totalParticipants }}</p>
        <p class="mt-1 text-sm text-slate-500">Suma de participantes en todas las sesiones.</p>
      </article>
      <article class="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
        <h2 class="text-sm font-medium text-slate-500">Próxima sesión</h2>
        <div v-if="nextSession" class="mt-3">
          <p class="text-lg font-semibold text-slate-800">{{ nextSession.name }}</p>
          <p class="text-sm text-slate-500">{{ formatDate(nextSession.date) }}</p>
        </div>
        <p v-else class="mt-3 text-lg font-semibold text-slate-800">Sin sesiones planificadas</p>
      </article>
    </div>

    <div class="bg-white rounded-2xl shadow-md border border-slate-100">
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h2 class="text-lg font-semibold text-slate-800">Sesiones recientes</h2>
        <router-link
          to="/sesiones"
          class="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700 transition-colors"
        >
          Crear sesión
        </router-link>
      </div>
      <div class="px-6 py-6">
        <div v-if="sessions.length === 0" class="text-center text-slate-500">
          No hay sesiones registradas todavía. ¡Crea tu primera sesión!
        </div>
        <ul v-else class="space-y-4">
          <li
            v-for="session in recentSessions"
            :key="session.id"
            class="rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p class="text-lg font-semibold text-slate-800">{{ session.name }}</p>
                <p class="text-sm text-slate-500">{{ session.description }}</p>
              </div>
              <div class="flex items-center gap-6 text-sm text-slate-500">
                <span class="inline-flex items-center gap-2">
                  <span class="h-2 w-2 rounded-full bg-indigo-500"></span>
                  {{ formatDate(session.date) }}
                </span>
                <span>{{ session.participants.length }} participantes</span>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script>
import { loadSessions } from '../utils/storage.js';

export default {
  name: 'HomeView',
  data() {
    return {
      sessions: []
    };
  },
  computed: {
    totalSessions() {
      return this.sessions.length;
    },
    totalParticipants() {
      return this.sessions.reduce((acc, session) => acc + session.participants.length, 0);
    },
    nextSession() {
      if (this.sessions.length === 0) {
        return null;
      }
      const sorted = [...this.sessions].sort((a, b) => new Date(a.date) - new Date(b.date));
      const upcoming = sorted.find((session) => new Date(session.date) >= new Date());
      return upcoming || sorted[sorted.length - 1];
    },
    recentSessions() {
      return [...this.sessions]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
    }
  },
  created() {
    this.fetchSessions();
  },
  mounted() {
    window.addEventListener('storage', this.handleStorageChange);
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.handleStorageChange);
  },
  methods: {
    fetchSessions() {
      this.sessions = loadSessions();
    },
    handleStorageChange(event) {
      if (event.key === 'fmpk_sessions') {
        this.fetchSessions();
      }
    },
    formatDate(value) {
      if (!value) {
        return 'Sin fecha asignada';
      }
      const date = new Date(value);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }
  },
  watch: {
    '$route'() {
      this.fetchSessions();
    }
  }
};
</script>
