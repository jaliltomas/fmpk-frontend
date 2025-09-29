<template>
  <section class="space-y-8">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-slate-900">Nueva Sesión de Matcheo</h1>
        <p class="text-sm text-slate-500">
          Configurá los productos solicitados y los sitios a matchear antes de guardar la sesión.
        </p>
      </div>
      <button
        type="button"
        class="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="!canSaveSession"
        @click="handleSaveSession"
      >
        Guardar Sesión
      </button>
    </div>

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div class="space-y-6 xl:col-span-2">
        <div class="bg-white border border-slate-100 rounded-2xl shadow-md p-6">
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div class="col-span-1 md:col-span-2">
              <label for="session-name" class="block text-sm font-medium text-slate-600">Nombre de la sesión</label>
              <input
                id="session-name"
                v-model="sessionName"
                type="text"
                class="mt-1 w-full rounded-md border border-slate-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ej. Match de catálogos Q2"
              />
            </div>
          </div>

          <div class="mt-6">
            <h2 class="text-lg font-semibold text-slate-900">Productos solicitados</h2>
            <p class="mt-1 text-sm text-slate-500">
              Subí un archivo JSON con los productos que se necesitan matchear. Sólo se admite un archivo por sesión.
            </p>

            <div class="mt-4">
              <label class="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-indigo-300 bg-indigo-50/40 px-4 py-6 text-center transition hover:border-indigo-400 hover:bg-indigo-50">
                <span class="text-sm font-medium text-indigo-600">Seleccionar archivo</span>
                <span class="mt-1 text-xs text-slate-500">Formatos soportados: JSON</span>
                <input
                  type="file"
                  accept="application/json"
                  class="sr-only"
                  @change="handleProductsFileChange"
                />
              </label>
              <p v-if="requestedProducts.fileName" class="mt-3 text-sm text-slate-600">
                Archivo cargado: <span class="font-medium">{{ requestedProducts.fileName }}</span>
                <span class="block text-xs text-slate-500">{{ requestedProducts.count }} productos detectados</span>
              </p>
              <p v-else class="mt-3 text-sm text-slate-400">Todavía no se cargó ningún archivo.</p>
              <p v-if="requestedProducts.error" class="mt-2 text-sm text-rose-500">{{ requestedProducts.error }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white border border-slate-100 rounded-2xl shadow-md p-6">
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 class="text-lg font-semibold text-slate-900">Configuración de Nodos de Matcheo</h2>
              <p class="text-sm text-slate-500">Definí las estrategias y ordená cómo se ejecutarán.</p>
            </div>
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700 transition-colors"
              @click="openNodeModal"
            >
              + Agregar Nodo
            </button>
          </div>

          <div v-if="nodes.length === 0" class="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-10 text-center text-sm text-slate-500">
            Agregá al menos un nodo de matcheo para continuar.
          </div>

          <div v-else class="mt-6 space-y-3">
            <div
              v-for="(node, index) in nodes"
              :key="node.id"
              class="bg-white shadow rounded-xl p-3 flex items-center justify-between border border-slate-200"
              draggable="true"
              @dragstart="handleNodeDragStart(index)"
              @dragover.prevent
              @drop="handleNodeDrop(index)"
              @dragend="handleNodeDragEnd"
            >
              <div class="flex items-center gap-3">
                <button
                  type="button"
                  class="text-slate-400 hover:text-slate-600"
                  aria-label="Reordenar nodo"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M4 10h16M4 14h16" />
                  </svg>
                </button>
                <span class="text-sm font-medium text-slate-700">{{ node.name }}</span>
              </div>
              <button
                type="button"
                class="text-sm font-medium text-red-500 hover:text-red-700"
                @click="removeNode(node.id)"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>

        <div class="bg-white border border-slate-100 rounded-2xl shadow-md p-6">
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 class="text-lg font-semibold text-slate-900">Sitios</h2>
              <p class="text-sm text-slate-500">Cargá los sitios que se van a matchear con sus respectivos catálogos.</p>
            </div>
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700 transition-colors"
              @click="openNewSiteModal"
            >
              + Nuevo Sitio
            </button>
          </div>

          <div v-if="sites.length === 0" class="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-10 text-center text-sm text-slate-500">
            Todavía no se cargaron sitios.
          </div>

          <div v-else class="mt-6 overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200">
              <thead class="bg-slate-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Nombre
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    URL Base
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Archivo
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 bg-white">
                <tr v-for="site in sites" :key="site.id" class="hover:bg-slate-50">
                  <td class="px-6 py-4 text-sm font-medium text-slate-900">
                    {{ site.name }}
                    <span class="block text-xs font-normal text-slate-500">{{ site.productCount }} productos</span>
                  </td>
                  <td class="px-6 py-4 text-sm text-slate-600">
                    <a :href="site.baseUrl" target="_blank" rel="noopener" class="text-indigo-600 hover:underline">{{ site.baseUrl }}</a>
                  </td>
                  <td class="px-6 py-4 text-sm text-slate-600">{{ site.fileName }}</td>
                  <td class="px-6 py-4 text-sm">
                    <div class="flex flex-wrap gap-2">
                      <button
                        type="button"
                        class="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
                        @click="editSite(site)"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        class="rounded-lg border border-rose-200 px-3 py-2 text-sm font-medium text-rose-500 hover:bg-rose-50 transition-colors"
                        @click="removeSite(site.id)"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="bg-white border border-slate-100 rounded-2xl shadow-md p-6">
          <h2 class="text-lg font-semibold text-slate-900">Métricas de la sesión</h2>
          <dl class="mt-6 space-y-4">
            <div class="flex items-center justify-between">
              <dt class="text-sm text-slate-500">Total de productos solicitados</dt>
              <dd class="text-base font-semibold text-slate-900">{{ totalRequestedProducts }}</dd>
            </div>
            <div class="flex items-center justify-between">
              <dt class="text-sm text-slate-500">Total de productos en sitios</dt>
              <dd class="text-base font-semibold text-slate-900">{{ totalSiteProducts }}</dd>
            </div>
            <div class="flex items-center justify-between">
              <dt class="text-sm text-slate-500">% de match estimado</dt>
              <dd class="text-base font-semibold text-indigo-600">{{ formattedMatchRate }}</dd>
            </div>
          </dl>
        </div>

        <div v-if="formError" class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {{ formError }}
        </div>
      </div>
    </div>

    <div
      v-if="showSiteModal"
      class="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 px-4 py-6"
    >
      <div class="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h3 class="text-lg font-semibold text-slate-900">{{ editingSiteId ? 'Editar sitio' : 'Nuevo sitio' }}</h3>
            <p class="text-sm text-slate-500">Completá los datos del sitio y cargá el JSON de productos.</p>
          </div>
          <button
            type="button"
            class="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            @click="closeSiteModal"
            aria-label="Cerrar"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <form class="mt-6 space-y-4" @submit.prevent="saveSite">
          <div>
            <label for="site-name" class="block text-sm font-medium text-slate-600">Nombre del sitio</label>
            <input
              id="site-name"
              v-model="siteForm.name"
              type="text"
              class="mt-1 w-full rounded-md border border-slate-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ej. MercadoLibre"
              required
            />
          </div>
          <div>
            <label for="site-url" class="block text-sm font-medium text-slate-600">URL Base</label>
            <input
              id="site-url"
              v-model="siteForm.baseUrl"
              type="url"
              class="mt-1 w-full rounded-md border border-slate-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://www.ejemplo.com"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-600">Archivo JSON de scrape</label>
            <input
              type="file"
              accept="application/json"
              class="mt-1 w-full text-sm"
              @change="handleSiteFileChange"
            />
            <p v-if="siteForm.fileName" class="mt-2 text-sm text-slate-600">
              Archivo cargado: <span class="font-medium">{{ siteForm.fileName }}</span>
              <span class="block text-xs text-slate-500">{{ siteForm.productCount }} productos detectados</span>
            </p>
            <p v-else class="mt-2 text-sm text-slate-400">Seleccioná un archivo JSON.</p>
            <p v-if="siteForm.error" class="mt-2 text-sm text-rose-500">{{ siteForm.error }}</p>
          </div>
          <div class="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors"
              @click="closeSiteModal"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700 transition-colors"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>

    <div
      v-if="showNodeModal"
      class="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 px-4 py-6"
    >
      <div class="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h3 class="text-lg font-semibold text-slate-900">Agregar nodo de matcheo</h3>
            <p class="text-sm text-slate-500">Seleccioná la estrategia que querés ejecutar.</p>
          </div>
          <button
            type="button"
            class="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            @click="closeNodeModal"
            aria-label="Cerrar"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <form class="mt-6 space-y-4" @submit.prevent="addNode">
          <div>
            <label for="node-type" class="block text-sm font-medium text-slate-600">Nodo disponible</label>
            <select
              id="node-type"
              v-model="nodeForm.type"
              class="mt-1 w-full rounded-md border border-slate-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option v-for="option in availableNodes" :key="option" :value="option">{{ option }}</option>
            </select>
          </div>
          <div class="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors"
              @click="closeNodeModal"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700 transition-colors"
            >
              Agregar
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script>
import { generateSessionId, loadSessions, saveSessions } from '../utils/storage.js';

const SITE_KEYS = ['products', 'items', 'data'];
const AVAILABLE_NODES = ['EAN', 'Embeddings', 'AIEAN', 'Nombre', 'Descripción'];

export default {
  name: 'SessionView',
  data() {
    return {
      sessionName: '',
      requestedProducts: {
        fileName: '',
        count: 0,
        error: ''
      },
      sites: [],
      nodes: [],
      matchRate: null,
      formError: '',
      showSiteModal: false,
      showNodeModal: false,
      editingSiteId: null,
      siteForm: {
        name: '',
        baseUrl: '',
        fileName: '',
        productCount: 0,
        error: ''
      },
      nodeForm: {
        type: AVAILABLE_NODES[0]
      },
      draggedNodeIndex: null,
      availableNodes: AVAILABLE_NODES
    };
  },
  computed: {
    totalRequestedProducts() {
      return this.requestedProducts.count || 0;
    },
    totalSiteProducts() {
      if (!Array.isArray(this.sites)) {
        return 0;
      }
      return this.sites.reduce((acc, site) => acc + (site.productCount || 0), 0);
    },
    formattedMatchRate() {
      if (typeof this.matchRate !== 'number') {
        return '—';
      }
      return `${this.matchRate.toFixed(1)}%`;
    },
    canSaveSession() {
      return Boolean(this.sessionName.trim() && this.requestedProducts.fileName && this.nodes.length > 0);
    }
  },
  created() {
    this.matchRate = this.generateRandomMatch();
  },
  methods: {
    handleProductsFileChange(event) {
      const file = event.target.files[0];
      if (!file) {
        this.requestedProducts.fileName = '';
        this.requestedProducts.count = 0;
        this.requestedProducts.error = '';
        return;
      }

      this.readJsonFile(file)
        .then((parsed) => {
          const count = this.extractItemsCount(parsed);
          this.requestedProducts.fileName = file.name;
          this.requestedProducts.count = count;
          this.requestedProducts.error = '';
        })
        .catch(() => {
          this.requestedProducts.fileName = '';
          this.requestedProducts.count = 0;
          this.requestedProducts.error = 'No se pudo leer el archivo JSON. Verificá el formato.';
        })
        .finally(() => {
          event.target.value = '';
        });
    },
    openNewSiteModal() {
      this.editingSiteId = null;
      this.siteForm = {
        name: '',
        baseUrl: '',
        fileName: '',
        productCount: 0,
        error: ''
      };
      this.showSiteModal = true;
    },
    closeSiteModal() {
      this.showSiteModal = false;
      this.editingSiteId = null;
      this.siteForm.error = '';
    },
    openNodeModal() {
      this.nodeForm.type = this.availableNodes[0];
      this.showNodeModal = true;
    },
    closeNodeModal() {
      this.showNodeModal = false;
    },
    handleSiteFileChange(event) {
      const file = event.target.files[0];
      if (!file) {
        return;
      }

      this.readJsonFile(file)
        .then((parsed) => {
          const count = this.extractItemsCount(parsed);
          this.siteForm.fileName = file.name;
          this.siteForm.productCount = count;
          this.siteForm.error = '';
        })
        .catch(() => {
          this.siteForm.fileName = '';
          this.siteForm.productCount = 0;
          this.siteForm.error = 'No se pudo leer el archivo JSON del sitio.';
        })
        .finally(() => {
          event.target.value = '';
        });
    },
    saveSite() {
      if (!this.siteForm.name.trim() || !this.siteForm.baseUrl.trim()) {
        this.siteForm.error = 'Completá el nombre y la URL del sitio.';
        return;
      }

      if (!this.siteForm.fileName) {
        this.siteForm.error = 'Cargá el JSON de scrape del sitio.';
        return;
      }

      const payload = {
        id: this.editingSiteId || `site-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: this.siteForm.name.trim(),
        baseUrl: this.siteForm.baseUrl.trim(),
        fileName: this.siteForm.fileName,
        productCount: this.siteForm.productCount || 0
      };

      if (this.editingSiteId) {
        this.sites = this.sites.map((site) => (site.id === this.editingSiteId ? payload : site));
      } else {
        this.sites = [...this.sites, payload];
      }

      this.closeSiteModal();
    },
    editSite(site) {
      this.editingSiteId = site.id;
      this.siteForm = {
        name: site.name,
        baseUrl: site.baseUrl,
        fileName: site.fileName,
        productCount: site.productCount,
        error: ''
      };
      this.showSiteModal = true;
    },
    removeSite(siteId) {
      this.sites = this.sites.filter((site) => site.id !== siteId);
    },
    addNode() {
      if (!this.nodeForm.type) {
        return;
      }

      const newNode = {
        id: `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: this.nodeForm.type
      };

      this.nodes = [...this.nodes, newNode];
      this.closeNodeModal();
    },
    removeNode(nodeId) {
      this.nodes = this.nodes.filter((node) => node.id !== nodeId);
    },
    handleNodeDragStart(index) {
      this.draggedNodeIndex = index;
    },
    handleNodeDrop(index) {
      if (this.draggedNodeIndex === null || this.draggedNodeIndex === index) {
        return;
      }

      const updatedNodes = [...this.nodes];
      const [movedNode] = updatedNodes.splice(this.draggedNodeIndex, 1);
      updatedNodes.splice(index, 0, movedNode);
      this.nodes = updatedNodes;
      this.draggedNodeIndex = null;
    },
    handleNodeDragEnd() {
      this.draggedNodeIndex = null;
    },
    extractItemsCount(parsed) {
      if (!parsed || typeof parsed !== 'object') {
        return Array.isArray(parsed) ? parsed.length : 0;
      }

      if (Array.isArray(parsed)) {
        return parsed.length;
      }

      for (const key of SITE_KEYS) {
        if (Array.isArray(parsed[key])) {
          return parsed[key].length;
        }
      }

      return 0;
    },
    readJsonFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const parsed = JSON.parse(event.target.result);
            resolve(parsed);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
      });
    },
    generateRandomMatch() {
      const value = 60 + Math.random() * 35;
      return Math.round(value * 10) / 10;
    },
    handleSaveSession() {
      this.formError = '';
      if (!this.canSaveSession) {
        this.formError = 'Ingresá el nombre de la sesión, cargá el JSON de productos solicitados y agregá al menos un nodo de matcheo.';
        return;
      }

      const trimmedName = this.sessionName.trim();
      const session = {
        id: generateSessionId(),
        name: trimmedName,
        createdAt: new Date().toISOString(),
        matchRate: this.matchRate,
        sitesCount: this.sites.length,
        requestedProductsCount: this.totalRequestedProducts,
        totalSiteProducts: this.totalSiteProducts,
        sites: this.sites,
        nodes: this.nodes
      };

      const storedSessions = loadSessions();
      const updatedSessions = [session, ...storedSessions];
      saveSessions(updatedSessions);

      this.$router.push({ name: 'home' });
    }
  }
};
</script>
