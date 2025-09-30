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

    <div v-if="fetchError" class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
      {{ fetchError }}
    </div>

    <div
      v-else-if="isFetching && !session"
      class="rounded-2xl border border-slate-100 bg-white p-8 text-center text-slate-500"
    >
      Cargando sesión...
    </div>

    <div
      v-else-if="!session"
      class="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500"
    >
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

      <section v-if="isProcessingMatches" class="rounded-2xl border border-slate-100 bg-white p-8 shadow-md">
        <div class="flex flex-col items-center gap-4 text-center">
          <div class="w-full max-w-xl">
            <div class="h-3 w-full overflow-hidden rounded-full bg-indigo-100">
              <div class="h-full rounded-full bg-indigo-500 transition-all duration-300" :style="{ width: `${loadingProgress}%` }"></div>
            </div>
          </div>
          <div class="flex items-center gap-2 text-indigo-600">
            <span class="inline-block h-3 w-3 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent"></span>
            <span class="text-sm font-medium">Procesando matcheos...</span>
          </div>
          <p class="text-xs text-slate-500">Este proceso puede tardar unos segundos.</p>
        </div>
      </section>

      <section v-else class="space-y-6">
        <div
          v-if="isFetching"
          class="rounded-2xl border border-slate-100 bg-white p-8 text-center text-slate-500"
        >
          Actualizando datos de la sesión...
        </div>

        <div
          v-else-if="totalRows === 0"
          class="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500"
        >
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
              class="inline-flex items-center justify-center rounded-lg border border-indigo-200 px-4 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isProcessingMatches || isFetching"
              @click="resetValidations"
            >
              Reiniciar validaciones
            </button>
          </header>

          <div v-if="processingError" class="px-6 pt-4 text-sm text-rose-600">
            {{ processingError }}
          </div>

          <div v-if="!hasSites" class="px-6 py-6 text-sm text-slate-500">
            No hay sitios cargados para validar matcheos.
          </div>

          <div v-else>
            <div class="flex flex-col gap-4 border-b border-slate-100 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div class="text-sm text-slate-500">
                Mostrando
                <span class="font-medium text-slate-700">{{ pageStart }}</span>
                -
                <span class="font-medium text-slate-700">{{ pageEnd }}</span>
                de
                <span class="font-medium text-slate-700">{{ totalRows }}</span>
                productos solicitados
              </div>
              <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
                <label class="flex items-center gap-2 text-sm text-slate-500">
                  <span>Filas por página</span>
                  <select
                    v-model.number="pageSize"
                    class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option v-for="option in pageSizeOptions" :key="option" :value="option">
                      {{ option }}
                    </option>
                  </select>
                </label>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    class="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    :disabled="currentPage === 1"
                    @click="goToPreviousPage"
                  >
                    Anterior
                  </button>
                  <span class="text-sm font-medium text-slate-600">
                    Página {{ currentPage }} de {{ totalPages }}
                  </span>
                  <button
                    type="button"
                    class="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    :disabled="currentPage === totalPages"
                    @click="goToNextPage"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-slate-200">
                <thead class="bg-slate-50">
                  <tr>
                    <th scope="col" class="min-w-[200px] px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Producto solicitado
                    </th>
                    <th
                      v-for="site in displaySites"
                      :key="site.id || site.name"
                      scope="col"
                      class="min-w-[220px] px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                      {{ site.name }}
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 bg-white">
                  <tr v-for="row in paginatedRows" :key="row.id" class="hover:bg-slate-50">
                    <td class="px-6 py-4 text-sm font-medium text-slate-900">
                      {{ row.name }}
                    </td>
                    <td
                      v-for="match in row.matches"
                      :key="match.id"
                      class="px-6 py-4"
                    >
                      <div class="space-y-3">
                        <p class="text-sm font-medium text-slate-700">{{ match.value }}</p>
                        <p class="text-xs text-slate-500">{{ match.siteName }}</p>
                        <p v-if="match.disabled" class="text-xs italic text-slate-400">
                          Sin candidato disponible
                        </p>
                        <div v-else class="flex flex-wrap gap-2">
                          <button
                            type="button"
                            class="rounded-lg px-3 py-1 text-xs font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60"
                            :class="[
                              match.status === true
                                ? 'bg-green-500 text-white hover:bg-green-600'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            ]"
                            :disabled="isProcessingMatches || isFetching || updatingCandidateId === match.id"
                            @click="markMatch(row.id, match.id, true)"
                          >
                            Correcto
                          </button>
                          <button
                            type="button"
                            class="rounded-lg px-3 py-1 text-xs font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60"
                            :class="[
                              match.status === false
                                ? 'bg-rose-500 text-white hover:bg-rose-600'
                                : 'bg-rose-100 text-rose-600 hover:bg-rose-200'
                            ]"
                            :disabled="isProcessingMatches || isFetching || updatingCandidateId === match.id"
                            @click="markMatch(row.id, match.id, false)"
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
          <div v-if="actionError" class="px-6 pt-4 text-sm text-rose-600">
            {{ actionError }}
          </div>
            <div class="flex flex-col items-center gap-4 border-t border-slate-100 px-6 py-4 sm:flex-row sm:justify-between">
              <p class="text-xs text-slate-500">
                Página {{ currentPage }} de {{ totalPages }} · {{ pageSize }} filas por página
              </p>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="currentPage === 1"
                  @click="goToFirstPage"
                >
                  Primera
                </button>
                <button
                  type="button"
                  class="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="currentPage === 1"
                  @click="goToPreviousPage"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  class="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="currentPage === totalPages"
                  @click="goToNextPage"
                >
                  Siguiente
                </button>
                <button
                  type="button"
                  class="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="currentPage === totalPages"
                  @click="goToLastPage"
                >
                  Última
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<script>
import {
  getSession,
  resetSessionMatching,
  updateCandidateStatus
} from '../utils/api.js';

export default {
  name: 'SessionDetail',
  data() {
    return {
      session: null,
      matchRows: [],
      isFetching: false,
      fetchError: '',
      isProcessingMatches: false,
      processingError: '',
      actionError: '',
      loadingProgress: 0,
      progressInterval: null,
      currentPage: 1,
      pageSize: 25,
      pageSizeOptions: [10, 25, 50, 100],
      updatingCandidateId: null
    };
  },
  computed: {
    hasSites() {
      return this.displaySites.length > 0;
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
      if (
        this.session.requestedProductsMetadata &&
        typeof this.session.requestedProductsMetadata.count === 'number'
      ) {
        return this.session.requestedProductsMetadata.count;
      }
      if (Array.isArray(this.session.requestedProducts)) {
        return this.session.requestedProducts.length;
      }
      if (this.session.metrics && typeof this.session.metrics.requestedProducts === 'number') {
        return this.session.metrics.requestedProducts;
      }
      return 0;
    },
    displaySites() {
      const sessionSites = Array.isArray(this.session?.sites)
        ? this.session.sites.map((site, index) => ({
            id: this.resolveSiteIdentifier(site, index),
            name: site.name || site.displayName || `Sitio ${index + 1}`
          }))
        : [];

      const extras = new Map();

      this.matchRows.forEach((row) => {
        const map = this.getMatchMap(row);
        map.forEach((match) => {
          if (
            !sessionSites.some((site) => this.areSiteIdsEqual(site.id, match.siteId)) &&
            !extras.has(match.siteId)
          ) {
            extras.set(match.siteId, {
              id: match.siteId,
              name: match.siteName || `Sitio ${sessionSites.length + extras.size + 1}`
            });
          }
        });
      });

      return [...sessionSites, ...extras.values()];
    },
    validationStats() {
      let validated = 0;
      let correct = 0;

      this.matchRows.forEach((row) => {
        const map = this.getMatchMap(row);
        map.forEach((match) => {
          if (match.disabled) {
            return;
          }
          if (match.status === true || match.status === false) {
            validated += 1;
            if (match.status === true) {
              correct += 1;
            }
          }
        });
      });

      const computedEfficacy = validated > 0 ? (correct / validated) * 100 : null;
      const sessionEfficacy = this.extractSessionEfficacy();

      return {
        validated,
        correct,
        efficacy: computedEfficacy !== null ? computedEfficacy : sessionEfficacy
      };
    },
    formattedEfficacy() {
      if (
        typeof this.validationStats.efficacy !== 'number' ||
        Number.isNaN(this.validationStats.efficacy)
      ) {
        return '—';
      }
      return `${this.validationStats.efficacy.toFixed(1)}%`;
    },
    validationSummary() {
      if (this.validationStats.validated === 0) {
        return 'Todavía no validaste matcheos';
      }
      return `${this.validationStats.correct} correctos de ${this.validationStats.validated} validados`;
    },
    totalRows() {
      return Array.isArray(this.matchRows) ? this.matchRows.length : 0;
    },
    totalPages() {
      if (this.totalRows === 0) {
        return 1;
      }
      return Math.ceil(this.totalRows / this.pageSize);
    },
    pageStart() {
      if (this.totalRows === 0) {
        return 0;
      }
      return (this.currentPage - 1) * this.pageSize + 1;
    },
    pageEnd() {
      if (this.totalRows === 0) {
        return 0;
      }
      return Math.min(this.currentPage * this.pageSize, this.totalRows);
    },
    paginatedRows() {
      if (!Array.isArray(this.matchRows) || this.matchRows.length === 0) {
        return [];
      }
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      const rowsSlice = this.matchRows.slice(start, end);
      const sites = this.displaySites;

      return rowsSlice.map((row) => {
        const map = this.getMatchMap(row);
        const matches = sites.map((site, index) => {
          const key = this.normalizeSiteId(site.id ?? index);
          const existing = map.get(key);
          if (existing) {
            return existing;
          }
          return {
            id: `${row.id}-${key}-placeholder`,
            siteId: key,
            siteName: site.name,
            value: 'Sin candidato asignado',
            status: null,
            disabled: true
          };
        });
        return {
          id: row.id,
          name: row.name,
          matches
        };
      });
    }
  },
  created() {
    this.loadSession({ runMatchingIfEmpty: true });
  },
  beforeUnmount() {
    this.clearProgressInterval();
  },
  watch: {
    '$route.params.id'() {
      this.currentPage = 1;
      this.loadSession({ runMatchingIfEmpty: true });
    },
    matchRows(newRows) {
      const total = Array.isArray(newRows) ? newRows.length : 0;
      if (total === 0) {
        this.currentPage = 1;
        return;
      }
      const maxPage = Math.max(1, Math.ceil(total / this.pageSize));
      if (this.currentPage > maxPage) {
        this.currentPage = maxPage;
      }
    },
    pageSize() {
      this.currentPage = 1;
    }
  },
  methods: {
    async loadSession({ runMatchingIfEmpty = false, preservePage = false } = {}) {
      const sessionId = this.$route.params.id;
      if (!sessionId) {
        this.session = null;
        this.matchRows = [];
        this.fetchError = '';
        return;
      }

      const previousPage = this.currentPage;

      this.isFetching = true;
      this.fetchError = '';
      this.actionError = '';

      try {
        const response = await getSession(sessionId);
        if (!response || typeof response !== 'object') {
          this.session = null;
          this.matchRows = [];
          this.fetchError = 'No se encontró la sesión solicitada.';
          return;
        }

        this.session = response;
        this.matchRows = this.normalizeMatchRows(response);

        if (preservePage) {
          const maxPage = Math.max(1, Math.ceil(this.totalRows / this.pageSize));
          this.currentPage = Math.min(previousPage, maxPage);
        } else {
          this.currentPage = 1;
        }

        if (this.matchRows.length === 0 && runMatchingIfEmpty) {
          await this.startMatchGeneration();
        }
      } catch (error) {
        this.fetchError = error.message || 'No se pudo cargar la sesión.';
        this.session = null;
        this.matchRows = [];
      } finally {
        this.isFetching = false;
      }
    },
    normalizeMatchRows(session) {
      const rawRows = Array.isArray(session?.matchRows)
        ? session.matchRows
        : Array.isArray(session?.matchrows)
        ? session.matchrows
        : Array.isArray(session?.match_results)
        ? session.match_results
        : [];

      return rawRows.map((row, index) => {
        const rowId = row.id || row.matchRowId || row.rowId || `match-row-${index}`;
        const productName =
          row.productName ||
          row.requestedProductName ||
          row.name ||
          row.title ||
          `Producto solicitado #${(row.orderIndex || index) + 1}`;

        const candidates = Array.isArray(row.candidates)
          ? row.candidates
          : Array.isArray(row.matchCandidates)
          ? row.matchCandidates
          : [];

        const matchesMap = new Map();

        candidates.forEach((candidate, candidateIndex) => {
          const siteId = this.resolveCandidateSiteId(candidate, candidateIndex);
          const key = this.normalizeSiteId(siteId ?? `${rowId}-${candidateIndex}`);
          const match = {
            id: candidate.id || candidate.candidateId || `${rowId}-candidate-${candidateIndex}`,
            siteId: key,
            siteName:
              candidate.sessionSite?.name ||
              candidate.site?.name ||
              candidate.siteName ||
              `Sitio ${candidateIndex + 1}`,
            value:
              candidate.productName ||
              candidate.displayName ||
              candidate.title ||
              candidate.name ||
              'Match sin descripción',
            status: this.resolveCandidateStatus(candidate.status),
            disabled: false
          };
          matchesMap.set(key, match);
        });

        return {
          id: rowId,
          name: productName,
          matchesMap
        };
      });
    },
    getMatchMap(row) {
      if (!row) {
        return new Map();
      }
      if (row.matchesMap instanceof Map) {
        return row.matchesMap;
      }
      if (Array.isArray(row.matches)) {
        const map = new Map();
        row.matches.forEach((match, index) => {
          const key = this.normalizeSiteId(match.siteId ?? index);
          map.set(key, match);
        });
        row.matchesMap = map;
        return map;
      }
      return new Map();
    },
    normalizeSiteId(value) {
      if (value === null || value === undefined) {
        return '';
      }
      return String(value);
    },
    resolveCandidateSiteId(candidate, fallbackIndex) {
      if (!candidate || typeof candidate !== 'object') {
        return `candidate-${fallbackIndex}`;
      }
      return (
        candidate.sessionSiteId ||
        candidate.siteId ||
        candidate.sessionSite?.id ||
        candidate.site?.id ||
        candidate.siteIdentifier ||
        `candidate-${fallbackIndex}`
      );
    },
    resolveSiteIdentifier(site, index) {
      if (!site || typeof site !== 'object') {
        return `site-${index}`;
      }
      return (
        site.id ||
        site.sessionSiteId ||
        site.siteId ||
        site.externalId ||
        site.uuid ||
        site.key ||
        `site-${index}`
      );
    },
    areSiteIdsEqual(a, b) {
      return this.normalizeSiteId(a) === this.normalizeSiteId(b);
    },
    resolveCandidateStatus(value) {
      if (value === true || value === false || value === null) {
        return value;
      }
      if (typeof value === 'string') {
        const normalized = value.toLowerCase();
        if (['true', '1', 'approved', 'correct', 'ok', 'match', 'matched'].includes(normalized)) {
          return true;
        }
        if (['false', '0', 'rejected', 'incorrect', 'ko', 'nomatch'].includes(normalized)) {
          return false;
        }
        if (['pending', 'null', 'undefined', 'unknown'].includes(normalized)) {
          return null;
        }
      }
      if (typeof value === 'number') {
        if (value === 1) {
          return true;
        }
        if (value === 0) {
          return false;
        }
      }
      return null;
    },
    extractSessionEfficacy() {
      const sources = [
        this.session?.metrics,
        this.session?.statistics,
        this.session?.validationStats,
        this.session?.matchMetrics
      ];
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
    },
    async startMatchGeneration() {
      if (!this.session) {
        return;
      }
      this.processingError = '';
      this.isProcessingMatches = true;
      this.loadingProgress = 0;
      this.startProgressAnimation();
      try {
        await resetSessionMatching(this.session.id);
        await this.delay(800);
        await this.loadSession({ runMatchingIfEmpty: false, preservePage: false });
      } catch (error) {
        this.processingError = error.message || 'No se pudieron regenerar los matcheos.';
      } finally {
        this.finishProgressAnimation();
      }
    },
    startProgressAnimation() {
      this.clearProgressInterval();
      this.progressInterval = window.setInterval(() => {
        if (this.loadingProgress < 90) {
          this.loadingProgress = Math.min(90, this.loadingProgress + Math.random() * 12);
        }
      }, 250);
    },
    finishProgressAnimation() {
      this.clearProgressInterval();
      this.loadingProgress = 100;
      window.setTimeout(() => {
        this.isProcessingMatches = false;
        this.loadingProgress = 0;
      }, 400);
    },
    clearProgressInterval() {
      if (this.progressInterval) {
        window.clearInterval(this.progressInterval);
        this.progressInterval = null;
      }
    },
    delay(ms) {
      return new Promise((resolve) => {
        window.setTimeout(resolve, ms);
      });
    },
    goToFirstPage() {
      this.goToPage(1);
    },
    goToPreviousPage() {
      this.goToPage(this.currentPage - 1);
    },
    goToNextPage() {
      this.goToPage(this.currentPage + 1);
    },
    goToLastPage() {
      this.goToPage(this.totalPages);
    },
    goToPage(page) {
      if (this.totalRows === 0) {
        this.currentPage = 1;
        return;
      }
      const safePage = Math.min(Math.max(page, 1), this.totalPages);
      this.currentPage = safePage;
    },
    async markMatch(rowId, candidateId, desiredStatus) {
      if (!this.session) {
        return;
      }
      const rowIndex = this.matchRows.findIndex((row) => row.id === rowId);
      if (rowIndex === -1) {
        return;
      }
      const row = this.matchRows[rowIndex];
      const map = this.getMatchMap(row);
      const match = Array.from(map.values()).find((item) => item.id === candidateId);
      if (!match || match.disabled || this.updatingCandidateId) {
        return;
      }
      const nextStatus = match.status === desiredStatus ? null : desiredStatus;
      const key = this.normalizeSiteId(match.siteId);
      const previousMatch = { ...match };
      const updatedMatch = { ...match, status: nextStatus };

      map.set(key, updatedMatch);
      this.matchRows = [...this.matchRows];

      this.updatingCandidateId = candidateId;
      this.actionError = '';

      try {
        await updateCandidateStatus(this.session.id, candidateId, nextStatus);
        await this.loadSession({ runMatchingIfEmpty: false, preservePage: true });
      } catch (error) {
        this.actionError = error.message || 'No se pudo actualizar la validación del matcheo.';
        map.set(key, previousMatch);
        this.matchRows = [...this.matchRows];
      } finally {
        this.updatingCandidateId = null;
      }
    },
    async resetValidations() {
      await this.startMatchGeneration();
    }
  }
};
</script>


<style scoped>
</style>
