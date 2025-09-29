<template>
  <section class="space-y-8">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-sm font-medium uppercase tracking-wide text-indigo-600">Sesión</p>
        <h1 class="text-2xl font-semibold text-slate-900">Detalle de Sesión</h1>
        <p v-if="session" class="mt-1 text-sm text-slate-500">
          Creada el {{ formattedDate }}
        </p>
      </div>
      <router-link
        to="/"
        class="inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition"
      >
        Volver a Home
      </router-link>
    </div>

    <div v-if="!session" class="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
      No se encontró la sesión seleccionada. Revisá el historial e intentá nuevamente.
    </div>

    <div v-else class="space-y-8">
      <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-md">
        <h2 class="text-lg font-semibold text-slate-900">{{ session.name }}</h2>
        <p class="mt-2 text-sm text-slate-500" v-if="session.description">{{ session.description }}</p>
        <dl class="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div class="rounded-xl bg-slate-50 p-4">
            <dt class="text-xs font-semibold uppercase tracking-wide text-slate-500">% de match</dt>
            <dd class="mt-2 text-2xl font-semibold text-slate-900">{{ formattedMatch }}</dd>
          </div>
          <div class="rounded-xl bg-slate-50 p-4">
            <dt class="text-xs font-semibold uppercase tracking-wide text-slate-500">Productos solicitados</dt>
            <dd class="mt-2 text-2xl font-semibold text-slate-900">{{ requestedProductsCount }}</dd>
          </div>
          <div class="rounded-xl bg-slate-50 p-4">
            <dt class="text-xs font-semibold uppercase tracking-wide text-slate-500">Productos en sitios</dt>
            <dd class="mt-2 text-2xl font-semibold text-slate-900">{{ totalSiteProducts }}</dd>
          </div>
          <div class="rounded-xl bg-slate-50 p-4">
            <dt class="text-xs font-semibold uppercase tracking-wide text-slate-500">Cantidad de sitios</dt>
            <dd class="mt-2 text-2xl font-semibold text-slate-900">{{ sitesCount }}</dd>
          </div>
        </dl>
      </div>

      <div class="rounded-2xl border border-slate-100 bg-white shadow-md">
        <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 class="text-lg font-semibold text-slate-900">Sitios cargados</h2>
          <span class="text-sm text-slate-500">{{ sitesCount }} en total</span>
        </div>
        <div v-if="sitesCount === 0" class="px-6 py-10 text-center text-slate-500">
          No hay sitios registrados en esta sesión.
        </div>
        <div v-else class="px-6 py-6">
          <div class="space-y-4">
            <article
              v-for="site in session.sites"
              :key="site.id || site.name"
              class="rounded-xl border border-slate-100 bg-slate-50 p-4"
            >
              <h3 class="text-base font-semibold text-slate-900">{{ site.name || 'Sitio sin nombre' }}</h3>
              <p v-if="site.baseUrl" class="mt-1 text-sm text-indigo-600 break-all">{{ site.baseUrl }}</p>
              <p v-if="site.fileName" class="mt-1 text-xs text-slate-500">Archivo: {{ site.fileName }}</p>
              <p v-else-if="site.file" class="mt-1 text-xs text-slate-500">Archivo cargado</p>
            </article>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { loadSessions } from '../utils/storage.js';

export default {
  name: 'SessionDetailView',
  data() {
    return {
      session: null
    };
  },
  computed: {
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
    matchRate() {
      return this.resolveMatchRate(this.session);
    },
    formattedMatch() {
      if (typeof this.matchRate !== 'number') {
        return 'Sin datos';
      }
      return `${this.matchRate.toFixed(1)}%`;
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
    totalSiteProducts() {
      if (!this.session) {
        return 0;
      }
      if (typeof this.session.totalSiteProducts === 'number') {
        return this.session.totalSiteProducts;
      }
      if (Array.isArray(this.session.sites)) {
        return this.session.sites.reduce((acc, site) => {
          if (typeof site.productsCount === 'number') {
            return acc + site.productsCount;
          }
          if (Array.isArray(site.products)) {
            return acc + site.products.length;
          }
          return acc;
        }, 0);
      }
      return 0;
    },
    sitesCount() {
      if (!this.session) {
        return 0;
      }
      if (typeof this.session.sitesCount === 'number') {
        return this.session.sitesCount;
      }
      if (Array.isArray(this.session.sites)) {
        return this.session.sites.length;
      }
      return 0;
    }
  },
  created() {
    this.fetchSession();
  },
  watch: {
    '$route.params.id'() {
      this.fetchSession();
    }
  },
  methods: {
    fetchSession() {
      const sessionId = this.$route.params.id;
      if (!sessionId) {
        this.session = null;
        return;
      }
      const sessions = loadSessions();
      this.session = sessions.find((item) => item.id === sessionId) || null;
    },
    resolveMatchRate(session) {
      if (!session) {
        return null;
      }
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
    }
  }
};
</script>
