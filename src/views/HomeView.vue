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

      <div v-if="isLoading" class="px-6 py-10 text-center text-slate-500">
        Cargando sesiones...
      </div>

      <div v-else-if="error" class="px-6 py-10 text-center text-rose-500">
        {{ error }}
      </div>

      <div v-else-if="!hasSessions" class="px-6 py-10 text-center text-slate-500">
        Todavía no hay sesiones
      </div>

      <div v-else class="grid gap-4 px-6 py-6 sm:grid-cols-2 xl:grid-cols-3">
        <SessionCard
          v-for="session in orderedSessions"
          :key="session.id"
          :nombre="session.name"
          :fecha="formatDate(session.createdAt)"
          :porcentaje-match="resolveMatchRate(session)"
          :cantidad-sitios="resolveSitesCount(session)"
          @select="goToSessionDetail(session.id)"
        />
      </div>
    </div>
  </section>
</template>

<script>
import SessionCard from '../components/SessionCard.vue';
import { listSessions } from '../utils/api.js';

export default {
  name: 'HomeView',
  components: {
    SessionCard
  },
  data() {
    return {
      sessions: [],
      pagination: null,
      isLoading: false,
      error: ''
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
  methods: {
    async fetchSessions() {
      this.isLoading = true;
      this.error = '';

      try {
        const response = await listSessions({ page: 1, pageSize: 50 });

        if (response && Array.isArray(response.data)) {
          this.sessions = response.data;
          this.pagination = response.pagination || null;
        } else if (Array.isArray(response)) {
          this.sessions = response;
          this.pagination = null;
        } else if (response && typeof response === 'object' && Array.isArray(response.items)) {
          this.sessions = response.items;
          this.pagination = response.pagination || null;
        } else {
          this.sessions = [];
          this.pagination = null;
        }
      } catch (error) {
        this.error = error.message || 'No se pudieron cargar las sesiones.';
        this.sessions = [];
        this.pagination = null;
      } finally {
        this.isLoading = false;
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
      const fromMetrics = this.extractMetricPercentage(session);
      if (fromMetrics !== null) {
        return fromMetrics;
      }
      if (typeof session.matchRate === 'number') {
        return this.ensurePercentage(session.matchRate);
      }
      if (typeof session.matchPercentage === 'number') {
        return this.ensurePercentage(session.matchPercentage);
      }
      if (session.match && typeof session.match.percentage === 'number') {
        return this.ensurePercentage(session.match.percentage);
      }
      if (typeof session.efficacy === 'number') {
        return this.ensurePercentage(session.efficacy);
      }
      if (typeof session.efficacyPercentage === 'number') {
        return this.ensurePercentage(session.efficacyPercentage);
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
      if (session.metrics && typeof session.metrics.totalSites === 'number') {
        return session.metrics.totalSites;
      }
      if (session.statistics && typeof session.statistics.sites === 'number') {
        return session.statistics.sites;
      }
      return 0;
    },
    goToSessionDetail(sessionId) {
      this.$router.push({ name: 'session-detail', params: { id: sessionId } });
    },
    extractMetricPercentage(session) {
      if (!session) {
        return null;
      }

      const sources = [session.metrics, session.statistics, session.matchMetrics, session.validationStats];

      for (const source of sources) {
        if (!source || typeof source !== 'object') {
          continue;
        }

        const candidates = [
          source.efficacy,
          source.efficacyPercentage,
          source.accuracy,
          source.matchRate,
          source.matchPercentage,
          source.successRate,
          source.percentage
        ];

        for (const candidate of candidates) {
          if (typeof candidate === 'number' && !Number.isNaN(candidate)) {
            return this.ensurePercentage(candidate);
          }
        }

        if (source.correct && source.validated) {
          const calculated = (source.correct / source.validated) * 100;
          if (!Number.isNaN(calculated)) {
            return calculated;
          }
        }
      }

      return null;
    },
    ensurePercentage(value) {
      if (typeof value !== 'number' || Number.isNaN(value)) {
        return null;
      }

      if (value <= 1) {
        return value * 100;
      }

      return value;
    }
  },
  watch: {
    '$route'() {
      this.fetchSessions();
    }
  }
};
</script>
