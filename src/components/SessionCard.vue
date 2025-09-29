<template>
  <article
    class="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-md transition ring-indigo-100 hover:ring-2 cursor-pointer"
    @click="handleClick"
  >
    <header class="space-y-1">
      <h3 class="text-lg font-semibold text-slate-900">{{ nombre }}</h3>
      <p class="text-sm text-slate-500">{{ fecha }}</p>
    </header>

    <div class="flex flex-wrap items-center gap-3">
      <span
        class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
        :class="badgeClasses"
      >
        {{ formattedMatch }}
      </span>
      <span class="text-sm font-medium text-slate-600">
        {{ cantidadSitios }} sitio<span v-if="cantidadSitios !== 1">s</span> cargado<span v-if="cantidadSitios !== 1">s</span>
      </span>
    </div>
  </article>
</template>

<script>
export default {
  name: 'SessionCard',
  props: {
    nombre: {
      type: String,
      required: true
    },
    fecha: {
      type: String,
      required: true
    },
    porcentajeMatch: {
      type: Number,
      required: false,
      default: null
    },
    cantidadSitios: {
      type: Number,
      required: true
    }
  },
  computed: {
    badgeClasses() {
      if (typeof this.porcentajeMatch !== 'number') {
        return 'bg-slate-100 text-slate-700';
      }
      if (this.porcentajeMatch > 80) {
        return 'bg-green-100 text-green-700';
      }
      if (this.porcentajeMatch >= 60) {
        return 'bg-yellow-100 text-yellow-700';
      }
      return 'bg-red-100 text-red-700';
    },
    formattedMatch() {
      if (typeof this.porcentajeMatch !== 'number') {
        return 'Sin datos';
      }
      return `${this.porcentajeMatch.toFixed(1)}%`;
    }
  },
  methods: {
    handleClick() {
      this.$emit('select');
    }
  }
};
</script>
