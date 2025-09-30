<template>
  <aside class="fixed top-[72px] bottom-0 left-0 w-64 bg-white border-r border-slate-200 shadow-sm">
    <nav class="mt-8">
      <ul class="space-y-2 px-4">
        <li>
          <router-link
            to="/"
            class="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            active-class="bg-indigo-100 text-indigo-700 font-semibold"
            exact-active-class="bg-indigo-100 text-indigo-700 font-semibold"
          >
            <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold">H</span>
            <span>Home</span>
          </router-link>
        </li>
        <li>
          <router-link
            to="/sesiones"
            class="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            active-class="bg-indigo-100 text-indigo-700 font-semibold"
          >
            <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold">S</span>
            <span>Sesiones</span>
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script>
export default {
  name: 'AppSidebar'
};
</script>
