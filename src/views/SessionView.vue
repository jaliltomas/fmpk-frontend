<template>
  <section class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div class="lg:col-span-1">
      <div class="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
        <h2 class="text-xl font-semibold text-slate-800">{{ isEditing ? 'Editar sesión' : 'Nueva sesión' }}</h2>
        <p class="mt-2 text-sm text-slate-500">
          Define los detalles de la sesión y agrega participantes (uno por línea o separados por comas).
        </p>

        <form class="mt-6 space-y-4" @submit.prevent="submitForm">
          <div>
            <label for="name" class="block text-sm font-medium text-slate-600">Nombre de la sesión</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="mt-1 border border-slate-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Match con inversores"
            />
          </div>
          <div>
            <label for="description" class="block text-sm font-medium text-slate-600">Descripción</label>
            <textarea
              id="description"
              v-model="form.description"
              rows="3"
              class="mt-1 border border-slate-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Objetivo de la sesión"
            ></textarea>
          </div>
          <div>
            <label for="date" class="block text-sm font-medium text-slate-600">Fecha</label>
            <input
              id="date"
              v-model="form.date"
              type="date"
              class="mt-1 border border-slate-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label for="participants" class="block text-sm font-medium text-slate-600">Participantes</label>
            <textarea
              id="participants"
              v-model="form.participantsText"
              rows="4"
              class="mt-1 border border-slate-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ana, Juan, Pedro"
            ></textarea>
            <p class="mt-1 text-xs text-slate-400">Separa los nombres por comas o saltos de línea.</p>
          </div>
          <div class="flex items-center gap-3">
            <button
              type="submit"
              class="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700 transition-colors"
            >
              {{ isEditing ? 'Actualizar sesión' : 'Crear sesión' }}
            </button>
            <button
              v-if="isEditing"
              type="button"
              class="text-sm font-medium text-slate-500 hover:text-slate-700"
              @click="resetForm"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="lg:col-span-2">
      <div class="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 class="text-xl font-semibold text-slate-800">Sesiones guardadas</h2>
            <p class="text-sm text-slate-500">Gestiona y actualiza tus sesiones de matching.</p>
          </div>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-xl border border-indigo-200 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
            @click="syncFromStorage"
          >
            Refrescar
          </button>
        </div>

        <div v-if="sessions.length === 0" class="mt-8 text-center text-slate-500">
          Aún no has creado sesiones. Usa el formulario para iniciar.
        </div>

        <ul v-else class="mt-6 space-y-4">
          <li
            v-for="session in orderedSessions"
            :key="session.id"
            class="rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition"
          >
            <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div class="space-y-2">
                <h3 class="text-lg font-semibold text-slate-800">{{ session.name }}</h3>
                <p class="text-sm text-slate-500">{{ session.description || 'Sin descripción' }}</p>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="participant in session.participants"
                    :key="participant"
                    class="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700"
                  >
                    {{ participant }}
                  </span>
                </div>
              </div>
              <div class="flex flex-col items-start md:items-end gap-3">
                <span class="text-sm text-slate-500">{{ formatDate(session.date) }}</span>
                <div class="flex gap-2">
                  <button
                    type="button"
                    class="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
                    @click="startEdit(session)"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    class="rounded-lg border border-rose-200 px-3 py-2 text-sm font-medium text-rose-500 hover:bg-rose-50 transition-colors"
                    @click="removeSession(session.id)"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script>
import { generateSessionId, loadSessions, saveSessions } from '../utils/storage.js';

export default {
  name: 'SessionView',
  data() {
    return {
      sessions: [],
      form: {
        id: null,
        name: '',
        description: '',
        date: '',
        participantsText: ''
      },
      isEditing: false
    };
  },
  computed: {
    orderedSessions() {
      return [...this.sessions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },
  created() {
    this.sessions = loadSessions();
  },
  methods: {
    submitForm() {
      const participants = this.parseParticipants(this.form.participantsText);
      const sessionPayload = {
        id: this.form.id || generateSessionId(),
        name: this.form.name.trim(),
        description: this.form.description.trim(),
        date: this.form.date,
        participants,
        createdAt: this.form.id
          ? this.sessions.find((session) => session.id === this.form.id).createdAt
          : new Date().toISOString()
      };

      if (!sessionPayload.name) {
        return;
      }

      if (this.isEditing) {
        this.sessions = this.sessions.map((session) =>
          session.id === sessionPayload.id ? sessionPayload : session
        );
      } else {
        this.sessions = [sessionPayload, ...this.sessions];
      }

      saveSessions(this.sessions);
      this.resetForm();
    },
    parseParticipants(text) {
      if (!text) {
        return [];
      }
      return text
        .split(/\n|,/)
        .map((value) => value.trim())
        .filter((value) => value.length > 0);
    },
    startEdit(session) {
      this.isEditing = true;
      this.form = {
        id: session.id,
        name: session.name,
        description: session.description,
        date: session.date,
        participantsText: session.participants.join(', ')
      };
    },
    resetForm() {
      this.isEditing = false;
      this.form = {
        id: null,
        name: '',
        description: '',
        date: '',
        participantsText: ''
      };
    },
    removeSession(sessionId) {
      this.sessions = this.sessions.filter((session) => session.id !== sessionId);
      saveSessions(this.sessions);
      if (this.isEditing && this.form.id === sessionId) {
        this.resetForm();
      }
    },
    syncFromStorage() {
      this.sessions = loadSessions();
    },
    formatDate(value) {
      if (!value) {
        return 'Sin fecha';
      }
      const date = new Date(value);
      return date.toLocaleDateString('es-ES', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }
  },
  watch: {
    sessions: {
      deep: true,
      handler(newSessions) {
        saveSessions(newSessions);
      }
    }
  }
};
</script>
