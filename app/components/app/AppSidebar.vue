<script setup lang="ts">
import {
  cadastrosNavGroup,
  dashboardsNavGroup,
  devolucoesNavGroup,
  logsNavGroup,
  navigationItems,
  rotasRastreioNavGroup,
  secondaryNavigation
} from './navigation'

const route = useRoute()

function isActive(to: string | undefined) {
  if (!to) return false
  if (to === '/') return route.path === '/' || route.path.startsWith('/operacoes/')
  return route.path === to || route.path.startsWith(`${to}/`)
}

const navLinkClass = 'nav-link flex w-full min-h-10 items-center gap-2.5 my-px rounded-md border-0 bg-transparent px-2.5 text-left text-[13px] text-[oklch(80%_0.03_253)] no-underline hover:bg-[oklch(29%_0.045_253)] [&_svg]:size-[15px] [&_svg]:shrink-0 [&_svg]:text-[oklch(66%_0.035_253)] [&>span:nth-child(2)]:flex-1'
const navLinkActiveClass = 'nav-link--active bg-[oklch(34%_0.075_253)] font-bold text-[oklch(98%_0.005_253)] [&_svg]:text-[oklch(95%_0.02_253)]'
const navLinkSubClass = 'nav-link--sub min-h-[34px] pl-[18px] text-xs [&_svg]:size-[13px] [&_svg]:shrink-0'
</script>

<template>
  <aside
    class="flex min-h-0 w-full min-w-0 flex-col overflow-hidden bg-via-sidebar px-3 pt-[22px] pb-3.5 text-[oklch(90%_0.02_253)]"
    data-testid="app-sidebar"
    aria-label="Barra lateral"
  >
    <div class="flex items-center gap-2.5 px-2 pb-[21px]">
      <img
        class="block size-[34px] object-contain"
        src="/assets/via-reversa-mark.png"
        alt=""
        aria-hidden="true"
      >
      <span>
        <strong class="block text-[13px] text-[oklch(98%_0.006_253)]">Via Reversa</strong>
        <small class="mt-px block text-[11px] text-[oklch(76%_0.03_253)]">Operação logística</small>
      </span>
    </div>

    <nav
      class="min-h-0 overflow-auto [scrollbar-width:none]"
      aria-label="Navegação principal"
    >
      <p class="mx-2.5 my-1.5 text-[10px] font-bold tracking-[0.13em] text-[oklch(66%_0.045_253)] uppercase">Operação</p>
      <NuxtLink
        v-for="item in navigationItems"
        :key="item.to"
        :to="item.to"
        :class="[navLinkClass, isActive(item.to) ? navLinkActiveClass : undefined]"
        :aria-current="isActive(item.to) ? 'page' : undefined"
      >
        <UIcon
          :name="item.icon"
          aria-hidden="true"
        />
        <span>{{ item.label }}</span>
        <span
          v-if="item.to === '/operacao/ao-vivo'"
          class="numeric min-w-[25px] rounded-[10px] bg-[oklch(34%_0.05_253)] px-1.5 py-0.5 text-center text-[10px] font-bold text-[oklch(87%_0.025_253)]"
        >146</span>
      </NuxtLink>

      <p class="mx-2.5 mt-[18px] mb-1.5 text-[10px] font-bold tracking-[0.13em] text-[oklch(66%_0.045_253)] uppercase">Gestão</p>

      <NavGroup
        :label="dashboardsNavGroup.label"
        :icon="dashboardsNavGroup.icon"
        :children="dashboardsNavGroup.children"
        test-id="dashboards"
        :nav-link-class="navLinkClass"
        :nav-link-active-class="navLinkActiveClass"
        :nav-link-sub-class="navLinkSubClass"
      />

      <NavGroup
        :label="rotasRastreioNavGroup.label"
        :icon="rotasRastreioNavGroup.icon"
        :children="rotasRastreioNavGroup.children"
        test-id="rotas-rastreio"
        :nav-link-class="navLinkClass"
        :nav-link-active-class="navLinkActiveClass"
        :nav-link-sub-class="navLinkSubClass"
      />

      <NavGroup
        :label="logsNavGroup.label"
        :icon="logsNavGroup.icon"
        :children="logsNavGroup.children"
        test-id="logs"
        :nav-link-class="navLinkClass"
        :nav-link-active-class="navLinkActiveClass"
        :nav-link-sub-class="navLinkSubClass"
      />

      <NavGroup
        :label="devolucoesNavGroup.label"
        :icon="devolucoesNavGroup.icon"
        :children="devolucoesNavGroup.children"
        test-id="devolucoes"
        :nav-link-class="navLinkClass"
        :nav-link-active-class="navLinkActiveClass"
        :nav-link-sub-class="navLinkSubClass"
      />

      <NavGroup
        :label="cadastrosNavGroup.label"
        :icon="cadastrosNavGroup.icon"
        :children="cadastrosNavGroup.children"
        test-id="cadastros"
        :nav-link-class="navLinkClass"
        :nav-link-active-class="navLinkActiveClass"
        :nav-link-sub-class="navLinkSubClass"
      />

      <NuxtLink
        v-for="item in secondaryNavigation"
        :key="item.label"
        :to="item.to"
        :class="[navLinkClass, isActive(item.to) ? navLinkActiveClass : undefined]"
        :aria-current="isActive(item.to) ? 'page' : undefined"
      >
        <UIcon
          :name="item.icon"
          aria-hidden="true"
        />
        <span>{{ item.label }}</span>
      </NuxtLink>
    </nav>

    <div class="flex-1" />
    <footer class="border-t border-via-sidebar-line pt-[9px]">
      <button
        :class="[navLinkClass, 'cursor-pointer']"
        type="button"
      >
        <UIcon
          name="i-lucide-circle-help"
          aria-hidden="true"
        />
        <span>Central de ajuda</span>
      </button>
    </footer>
  </aside>
</template>
