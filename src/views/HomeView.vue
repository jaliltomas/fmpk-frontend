<template>
  <section class="space-y-8">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-2xl font-semibold text-slate-900">Estadísticas Globales</h1>
    </div>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
      <article class="bg-white border border-slate-100 rounded-2xl shadow-md p-6">
        <h2 class="text-sm font-medium text-slate-500">% de match promedio</h2>
        <p class="mt-3 text-3xl font-semibold text-slate-900">{{ formattedAverageMatch }}</p>
        <p class="mt-1 text-sm text-slate-500">Promedio de efectividad en todas las sesiones.</p>
      </article>
      <article class="bg-white border border-slate-100 rounded-2xl shadow-md p-6">
        <h2 class="text-sm font-medium text-slate-500">Total de sesiones creadas</h2>
        <p class="mt-3 text-3xl font-semibold text-slate-900">{{ totalSessions }}</p>
        <p class="mt-1 text-sm text-slate-500">Sesiones registradas en FMPK.</p>
      </article>
      <article class="bg-white border border-slate-100 rounded-2xl shadow-md p-6">
        <h2 class="text-sm font-medium text-slate-500">Total de sitios cargados</h2>
        <p class="mt-3 text-3xl font-semibold text-slate-900">{{ totalSites }}</p>
        <p class="mt-1 text-sm text-slate-500">Suma de sitios vinculados a las sesiones.</p>
      </article>
    </div>

    <div class="bg-white border border-slate-100 rounded-2xl shadow-md">
      <div class="flex flex-col gap-4 px-6 py-4 border-b border-slate-100 md:flex-row md:items-center md:justify-between">
        <h2 class="text-lg font-semibold text-slate-900">Historial de Sesiones</h2>
        <router-link
          to="/sesiones"
          class="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700 transition-colors"
        >
          + Nueva Sesión
        </router-link>
      </div>

      <div v-if="!hasSessions" class="px-6 py-10 text-center text-slate-500">
        Todavía no hay sesiones
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Nombre de sesión
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Fecha de creación
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Estado (% de match)
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white">
            <tr v-for="session in orderedSessions" :key="session.id" class="hover:bg-slate-50">
              <td class="px-6 py-4 text-sm font-medium text-slate-900">
                {{ session.name }}
                <p v-if="session.description" class="text-xs font-normal text-slate-500">{{ session.description }}</p>
              </td>
              <td class="px-6 py-4 text-sm text-slate-600">{{ formatDate(session.createdAt) }}</td>
              <td class="px-6 py-4 text-sm font-semibold text-slate-900">
                {{ formatMatchRate(session) }}
              </td>
            </tr>
          </tbody>
        </table>
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
    hasSessions() {
      return this.sessions.length > 0;
    },
    totalSessions() {
      return this.sessions.length;
    },
    averageMatchValue() {
      const matchValues = this.sessions
        .map((session) => this.resolveMatchRate(session))
        .filter((value) => typeof value === 'number');

      if (matchValues.length === 0) {
        return 0;
      }

      const total = matchValues.reduce((acc, value) => acc + value, 0);
      return total / matchValues.length;
    },
    formattedAverageMatch() {
      return `${this.averageMatchValue.toFixed(1)}%`;
    },
    totalSites() {
      return this.sessions.reduce((acc, session) => acc + this.resolveSitesCount(session), 0);
    },
    orderedSessions() {
      return [...this.sessions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
        return 'Sin registro';
      }
      const date = new Date(value);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    },
    resolveMatchRate(session) {
      if (typeof session.matchRate === 'number') {
        return session.matchRate;
      }
      if (typeof session.matchPercentage === 'number') {
        return session.matchPercentage;
      }
      if (session.match && typeof session.match.percentage === 'number') {
        return session.match.percentage;
      }
      return null;
    },
    resolveSitesCount(session) {
      if (Array.isArray(session.sites)) {
        return session.sites.length;
      }
      if (typeof session.sitesCount === 'number') {
        return session.sitesCount;
      }
      if (Array.isArray(session.participants)) {
        return session.participants.length;
      }
      return 0;
    },
    formatMatchRate(session) {
      const value = this.resolveMatchRate(session);
      if (typeof value !== 'number') {
        return 'Sin datos';
      }
      return `${value.toFixed(1)}%`;
    }
  },
  watch: {
    '$route'() {
      this.fetchSessions();
    }
  }
};
</script>
