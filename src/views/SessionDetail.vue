<template>
  <section class="space-y-8">
    <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-sm font-medium uppercase tracking-wide text-indigo-600">Sesión</p>
        <h1 class="text-2xl font-semibold text-slate-900">Detalle de Sesión</h1>
        <p v-if="session" class="mt-1 text-sm text-slate-500">
          Creada el {{ formattedDate }}
        </p>
      </div>
      <router-link
        to="/"
        class="inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        Volver a Home
      </router-link>
    </header>

    <div v-if="!session" class="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
      No se encontró la sesión seleccionada. Revisá el historial e intentá nuevamente.
    </div>

    <div v-else class="space-y-8">
      <section class="rounded-2xl border border-slate-100 bg-white p-6 shadow-md">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 class="text-xl font-semibold text-slate-900">{{ session.name }}</h2>
            <p class="mt-1 text-sm text-slate-500">
              {{ sitesCount }} sitio<span v-if="sitesCount !== 1">s</span> cargado<span v-if="sitesCount !== 1">s</span> · {{ requestedProductsCount }} producto<span v-if="requestedProductsCount !== 1">s</span> solicitados
            </p>
          </div>
          <div class="rounded-2xl bg-indigo-50 px-4 py-3 text-center shadow-inner">
            <p class="text-xs font-semibold uppercase tracking-wide text-indigo-600">Eficacia de la sesión</p>
            <p class="mt-1 text-2xl font-semibold text-slate-900">
              {{ formattedEfficacy }}
            </p>
            <p class="text-xs text-slate-500">
              {{ validationSummary }}
            </p>
          </div>
        </div>
      </section>

      <section v-if="isLoading" class="rounded-2xl border border-slate-100 bg-white p-8 shadow-md">
        <div class="flex flex-col items-center gap-4 text-center">
          <div class="w-full max-w-xl">
            <div class="h-3 w-full overflow-hidden rounded-full bg-indigo-100">
              <div class="h-full rounded-full bg-indigo-500 transition-all duration-300" :style="{ width: `${loadingProgress}%` }"></div>
            </div>
          </div>
          <div class="flex items-center gap-2 text-indigo-600">
            <span class="inline-block h-3 w-3 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent"></span>
            <span class="text-sm font-medium">Procesando matcheos simulados...</span>
          </div>
          <p class="text-xs text-slate-500">Este proceso puede tardar unos segundos.</p>
        </div>
      </section>

      <section v-else class="space-y-6">
        <div v-if="matchRows.length === 0" class="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
          No hay información de matcheos disponible para esta sesión.
        </div>

        <div v-else class="rounded-2xl border border-slate-100 bg-white shadow-md">
          <header class="flex flex-col gap-2 border-b border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="text-lg font-semibold text-slate-900">Validación de matcheos</h2>
              <p class="text-sm text-slate-500">Marcá manualmente si cada matcheo es correcto o incorrecto.</p>
            </div>
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-lg border border-indigo-200 px-4 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50"
              @click="resetValidations"
            >
              Reiniciar validaciones
            </button>
          </header>

          <div v-if="!hasSites" class="px-6 py-6 text-sm text-slate-500">
            No hay sitios cargados para validar matcheos.
          </div>

          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200">
              <thead class="bg-slate-50">
                <tr>
                  <th scope="col" class="min-w-[200px] px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Producto solicitado
                  </th>
                  <th
                    v-for="site in session.sites"
                    :key="site.id || site.name"
                    scope="col"
                    class="min-w-[220px] px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {{ site.name }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 bg-white">
                <tr v-for="row in matchRows" :key="row.id" class="hover:bg-slate-50">
                  <td class="px-6 py-4 text-sm font-medium text-slate-900">
                    {{ row.name }}
                  </td>
                  <td
                    v-for="match in row.matches"
                    :key="match.siteId"
                    class="px-6 py-4"
                  >
                    <div class="space-y-3">
                      <p class="text-sm font-medium text-slate-700">{{ match.value }}</p>
                      <div class="flex flex-wrap gap-2">
                        <button
                          type="button"
                          class="rounded-lg px-3 py-1 text-xs font-semibold shadow-sm transition"
                          :class="[
                            match.status === true
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          ]"
                          @click="markMatch(row.id, match.siteId, true)"
                        >
                          Correcto
                        </button>
                        <button
                          type="button"
                          class="rounded-lg px-3 py-1 text-xs font-semibold shadow-sm transition"
                          :class="[
                            match.status === false
                              ? 'bg-rose-500 text-white hover:bg-rose-600'
                              : 'bg-rose-100 text-rose-600 hover:bg-rose-200'
                          ]"
                          @click="markMatch(row.id, match.siteId, false)"
                        >
                          Incorrecto
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<script>
import { loadSessions, saveSessions } from '../utils/storage.js';

export default {
  name: 'SessionDetail',
  data() {
    return {
      session: null,
      matchRows: [],
      isLoading: false,
      loadingProgress: 0,
      progressInterval: null,
      loadingTimeout: null
    };
  },
  computed: {
    hasSites() {
      return this.sitesCount > 0;
    },
    formattedDate() {
      if (!this.session || !this.session.createdAt) {
        return 'Sin registro';
      }
      const date = new Date(this.session.createdAt);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    },
    sitesCount() {
      if (!this.session || !Array.isArray(this.session.sites)) {
        return 0;
      }
      return this.session.sites.length;
    },
    requestedProductsCount() {
      if (!this.session) {
        return 0;
      }
      if (typeof this.session.requestedProductsCount === 'number') {
        return this.session.requestedProductsCount;
      }
      if (Array.isArray(this.session.requestedProducts)) {
        return this.session.requestedProducts.length;
      }
      return 0;
    },
    validationStats() {
      const rows = Array.isArray(this.matchRows) ? this.matchRows : [];
      let validated = 0;
      let correct = 0;

      rows.forEach((row) => {
        row.matches.forEach((match) => {
          if (match.status === true || match.status === false) {
            validated += 1;
            if (match.status === true) {
              correct += 1;
            }
          }
        });
      });

      const efficacy = validated > 0 ? (correct / validated) * 100 : null;

      return {
        validated,
        correct,
        efficacy
      };
    },
    formattedEfficacy() {
      if (this.validationStats.efficacy === null) {
        return '—';
      }
      return `${this.validationStats.efficacy.toFixed(1)}%`;
    },
    validationSummary() {
      if (this.validationStats.validated === 0) {
        return 'Todavía no validaste matcheos';
      }
      return `${this.validationStats.correct} correctos de ${this.validationStats.validated} validados`;
    }
  },
  created() {
    this.fetchSession();
  },
  beforeUnmount() {
    this.clearLoadingTimers();
  },
  watch: {
    '$route.params.id'() {
      this.fetchSession();
    }
  },
  methods: {
    fetchSession() {
      this.clearLoadingTimers();
      this.isLoading = false;
      this.loadingProgress = 0;
      const sessionId = this.$route.params.id;
      if (!sessionId) {
        this.session = null;
        this.matchRows = [];
        return;
      }

      const sessions = loadSessions();
      const found = sessions.find((item) => item.id === sessionId);
      this.session = found || null;

      if (!this.session) {
        this.matchRows = [];
        return;
      }

      if (Array.isArray(this.session.matchResults) && this.session.matchResults.length > 0) {
        this.matchRows = this.session.matchResults;
        this.isLoading = false;
        this.persistValidationStats();
        return;
      }

      this.matchRows = [];
      this.startSimulation();
    },
    startSimulation() {
      this.isLoading = true;
      this.loadingProgress = 0;

      this.progressInterval = window.setInterval(() => {
        if (this.loadingProgress < 95) {
          this.loadingProgress = Math.min(95, this.loadingProgress + Math.random() * 15);
        }
      }, 300);

      this.loadingTimeout = window.setTimeout(() => {
        this.generateMatchResults();
        this.finishSimulation();
      }, 2600);
    },
    finishSimulation() {
      this.clearLoadingTimers();
      this.loadingProgress = 100;
      window.setTimeout(() => {
        this.isLoading = false;
      }, 300);
    },
    clearLoadingTimers() {
      if (this.progressInterval) {
        window.clearInterval(this.progressInterval);
        this.progressInterval = null;
      }
      if (this.loadingTimeout) {
        window.clearTimeout(this.loadingTimeout);
        this.loadingTimeout = null;
      }
    },
    generateMatchResults() {
      if (!this.session) {
        return;
      }

      const sites = Array.isArray(this.session.sites) ? this.session.sites : [];
      const rowsCount = this.requestedProductsCount || 10;
      const fakeProducts = this.buildFakeProducts(rowsCount);

      const generated = fakeProducts.map((productName, index) => {
        const id = `product-${index + 1}`;
        return {
          id,
          name: productName,
          matches: sites.map((site) => ({
            siteId: site.id || `${site.name}-${index}`,
            siteName: site.name,
            value: this.generateFakeMatchValue(productName, site.name),
            status: null
          }))
        };
      });

      this.matchRows = generated;
      this.session.matchResults = generated;
      this.persistValidationStats();
      this.persistSession();
    },
    buildFakeProducts(count) {
      const names = [];
      for (let index = 0; index < count; index += 1) {
        names.push(`Producto solicitado #${index + 1}`);
      }
      return names;
    },
    generateFakeMatchValue(productName, siteName) {
      const descriptors = ['Match simulado', 'Coincidencia sugerida', 'Producto coincidente', 'Referencia sugerida'];
      const descriptor = descriptors[Math.floor(Math.random() * descriptors.length)];
      return `${descriptor} (${siteName} · ${productName.split('#')[0].trim()}${Math.floor(Math.random() * 900 + 100)})`;
    },
    markMatch(rowId, siteId, status) {
      const rows = [...this.matchRows];
      const rowIndex = rows.findIndex((row) => row.id === rowId);
      if (rowIndex === -1) {
        return;
      }

      const row = { ...rows[rowIndex] };
      const matches = row.matches.map((match) => {
        if (match.siteId !== siteId) {
          return match;
        }
        const nextStatus = match.status === status ? null : status;
        return {
          ...match,
          status: nextStatus
        };
      });

      row.matches = matches;
      rows.splice(rowIndex, 1, row);
      this.matchRows = rows;
      this.session.matchResults = rows;
      this.persistValidationStats();
      this.persistSession();
    },
    resetValidations() {
      if (!Array.isArray(this.matchRows) || this.matchRows.length === 0) {
        return;
      }
      this.matchRows = this.matchRows.map((row) => ({
        ...row,
        matches: row.matches.map((match) => ({
          ...match,
          status: null
        }))
      }));
      this.session.matchResults = this.matchRows;
      this.persistValidationStats();
      this.persistSession();
    },
    persistValidationStats() {
      if (!this.session) {
        return;
      }

      const stats = this.validationStats;
      this.session.validationStats = {
        validated: stats.validated,
        correct: stats.correct,
        efficacy: stats.efficacy
      };

      if (stats.efficacy !== null) {
        this.session.matchRate = Math.round(stats.efficacy * 10) / 10;
      } else if (typeof this.session.matchRate !== 'undefined') {
        delete this.session.matchRate;
      }
    },
    persistSession() {
      if (!this.session) {
        return;
      }

      const sessions = loadSessions();
      const index = sessions.findIndex((item) => item.id === this.session.id);
      if (index === -1) {
        return;
      }

      const updatedSessions = [...sessions];
      updatedSessions.splice(index, 1, this.session);
      saveSessions(updatedSessions);
    }
  }
};
</script>

<style scoped>
</style>
