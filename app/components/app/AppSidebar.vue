<script setup lang="ts">
import {
  cadastrosNavGroup,
  configuracoesNavGroup,
  dashboardsNavGroup,
  devolucoesNavGroup,
  faturasNavGroup,
  navigationItems,
  operacaoNavGroup,
  resumosNavGroup,
  secondaryNavigation,
  slaAnalyticsNavGroup
} from './navigation'

const route = useRoute()
const cadastrosOpen = ref(false)
const configuracoesOpen = ref(false)
const devolucoesOpen = ref(false)
const faturasOpen = ref(false)
const resumosOpen = ref(false)
const slaOpen = ref(false)
const dashboardsOpen = ref(false)
const operacaoOpen = ref(false)

function isActive(to: string | undefined) {
  if (!to) return false
  if (to === '/') return route.path === '/' || route.path.startsWith('/operacoes/')
  return route.path === to || route.path.startsWith(`${to}/`)
}

function groupHasActiveChild(children: { to?: string }[]) {
  return children.some((item) => Boolean(item.to) && isActive(item.to))
}

const operacaoActive = computed(() => groupHasActiveChild(operacaoNavGroup.children))

const cadastrosActive = computed(() => groupHasActiveChild(cadastrosNavGroup.children))

const devolucoesActive = computed(() => groupHasActiveChild(devolucoesNavGroup.children))

const faturasActive = computed(() =>
  groupHasActiveChild(faturasNavGroup.children)
  || route.path.startsWith('/faturas/')
)

const resumosActive = computed(() =>
  groupHasActiveChild(resumosNavGroup.children)
  || route.path.startsWith('/resumos/')
)

const slaActive = computed(() =>
  groupHasActiveChild(slaAnalyticsNavGroup.children)
  || route.path.startsWith('/sla/')
)

const dashboardsActive = computed(() =>
  groupHasActiveChild(dashboardsNavGroup.children)
  || route.path.startsWith('/dashboards/')
)

const configuracoesActive = computed(() =>
  groupHasActiveChild(configuracoesNavGroup.children)
  || route.path.startsWith('/configuracoes/')
)

watch(
  () => route.path,
  () => {
    if (cadastrosActive.value) cadastrosOpen.value = true
    if (configuracoesActive.value) configuracoesOpen.value = true
    if (devolucoesActive.value) devolucoesOpen.value = true
    if (faturasActive.value) faturasOpen.value = true
    if (resumosActive.value) resumosOpen.value = true
    if (slaActive.value) slaOpen.value = true
    if (dashboardsActive.value) dashboardsOpen.value = true
    if (operacaoActive.value) operacaoOpen.value = true
  },
  { immediate: true }
)

function toggleOperacao() {
  operacaoOpen.value = !operacaoOpen.value
}

function toggleCadastros() {
  cadastrosOpen.value = !cadastrosOpen.value
}

function toggleDevolucoes() {
  devolucoesOpen.value = !devolucoesOpen.value
}

function toggleFaturas() {
  faturasOpen.value = !faturasOpen.value
}

function toggleResumos() {
  resumosOpen.value = !resumosOpen.value
}

function toggleSla() {
  slaOpen.value = !slaOpen.value
}

function toggleDashboards() {
  dashboardsOpen.value = !dashboardsOpen.value
}

function toggleConfiguracoes() {
  configuracoesOpen.value = !configuracoesOpen.value
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
      </NuxtLink>

      <div class="my-px">
        <button
          :class="[navLinkClass, 'cursor-pointer']"
          type="button"
          :aria-expanded="operacaoOpen"
          aria-controls="nav-operacao-submenu"
          data-testid="nav-group-operacao"
          @click="toggleOperacao"
        >
          <UIcon
            :name="operacaoNavGroup.icon"
            aria-hidden="true"
          />
          <span>{{ operacaoNavGroup.label }}</span>
          <UIcon
            name="i-lucide-chevron-right"
            class="nav-chevron !size-[13px] transition-transform duration-160 ease-in-out"
            :class="operacaoOpen ? 'nav-chevron--open rotate-90' : undefined"
            aria-hidden="true"
          />
        </button>
        <div
          v-if="operacaoOpen"
          id="nav-operacao-submenu"
          class="py-0.5 pb-1.5"
          role="group"
          aria-label="Operação"
          data-testid="nav-submenu-operacao"
        >
          <NuxtLink
            v-for="item in operacaoNavGroup.children"
            :key="item.to"
            :to="item.to"
            :class="[navLinkClass, navLinkSubClass, isActive(item.to) ? navLinkActiveClass : undefined]"
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
        </div>
      </div>

      <p class="mx-2.5 mt-[18px] mb-1.5 text-[10px] font-bold tracking-[0.13em] text-[oklch(66%_0.045_253)] uppercase">Gestão</p>

      <div class="my-px">
        <button
          :class="[navLinkClass, 'cursor-pointer']"
          type="button"
          :aria-expanded="dashboardsOpen"
          aria-controls="nav-dashboards-submenu"
          data-testid="nav-group-dashboards"
          @click="toggleDashboards"
        >
          <UIcon
            :name="dashboardsNavGroup.icon"
            aria-hidden="true"
          />
          <span>{{ dashboardsNavGroup.label }}</span>
          <UIcon
            name="i-lucide-chevron-right"
            class="nav-chevron !size-[13px] transition-transform duration-160 ease-in-out"
            :class="dashboardsOpen ? 'nav-chevron--open rotate-90' : undefined"
            aria-hidden="true"
          />
        </button>
        <div
          v-if="dashboardsOpen"
          id="nav-dashboards-submenu"
          class="py-0.5 pb-1.5"
          role="group"
          aria-label="Dashboards"
          data-testid="nav-submenu-dashboards"
        >
          <NuxtLink
            v-for="item in dashboardsNavGroup.children"
            :key="item.to"
            :to="item.to"
            :class="[navLinkClass, navLinkSubClass, isActive(item.to) ? navLinkActiveClass : undefined]"
            :aria-current="isActive(item.to) ? 'page' : undefined"
          >
            <UIcon
              :name="item.icon"
              aria-hidden="true"
            />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </div>
      </div>

      <div class="my-px">
        <button
          :class="[navLinkClass, 'cursor-pointer']"
          type="button"
          :aria-expanded="slaOpen"
          aria-controls="nav-sla-submenu"
          data-testid="nav-group-sla"
          @click="toggleSla"
        >
          <UIcon
            :name="slaAnalyticsNavGroup.icon"
            aria-hidden="true"
          />
          <span>{{ slaAnalyticsNavGroup.label }}</span>
          <UIcon
            name="i-lucide-chevron-right"
            class="nav-chevron !size-[13px] transition-transform duration-160 ease-in-out"
            :class="slaOpen ? 'nav-chevron--open rotate-90' : undefined"
            aria-hidden="true"
          />
        </button>
        <div
          v-if="slaOpen"
          id="nav-sla-submenu"
          class="py-0.5 pb-1.5"
          role="group"
          aria-label="SLA"
          data-testid="nav-submenu-sla"
        >
          <NuxtLink
            v-for="item in slaAnalyticsNavGroup.children"
            :key="item.to"
            :to="item.to"
            :class="[navLinkClass, navLinkSubClass, isActive(item.to) ? navLinkActiveClass : undefined]"
            :aria-current="isActive(item.to) ? 'page' : undefined"
          >
            <UIcon
              :name="item.icon"
              aria-hidden="true"
            />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </div>
      </div>

      <div class="my-px">
        <button
          :class="[navLinkClass, 'cursor-pointer']"
          type="button"
          :aria-expanded="resumosOpen"
          aria-controls="nav-resumos-submenu"
          data-testid="nav-group-resumos"
          @click="toggleResumos"
        >
          <UIcon
            :name="resumosNavGroup.icon"
            aria-hidden="true"
          />
          <span>{{ resumosNavGroup.label }}</span>
          <UIcon
            name="i-lucide-chevron-right"
            class="nav-chevron !size-[13px] transition-transform duration-160 ease-in-out"
            :class="resumosOpen ? 'nav-chevron--open rotate-90' : undefined"
            aria-hidden="true"
          />
        </button>
        <div
          v-if="resumosOpen"
          id="nav-resumos-submenu"
          class="py-0.5 pb-1.5"
          role="group"
          aria-label="Resumos"
          data-testid="nav-submenu-resumos"
        >
          <NuxtLink
            v-for="item in resumosNavGroup.children"
            :key="item.to"
            :to="item.to"
            :class="[navLinkClass, navLinkSubClass, isActive(item.to) ? navLinkActiveClass : undefined]"
            :aria-current="isActive(item.to) ? 'page' : undefined"
          >
            <UIcon
              :name="item.icon"
              aria-hidden="true"
            />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </div>
      </div>

      <div class="my-px">
        <button
          :class="[navLinkClass, 'cursor-pointer']"
          type="button"
          :aria-expanded="faturasOpen"
          aria-controls="nav-faturas-submenu"
          data-testid="nav-group-faturas"
          @click="toggleFaturas"
        >
          <UIcon
            :name="faturasNavGroup.icon"
            aria-hidden="true"
          />
          <span>{{ faturasNavGroup.label }}</span>
          <UIcon
            name="i-lucide-chevron-right"
            class="nav-chevron !size-[13px] transition-transform duration-160 ease-in-out"
            :class="faturasOpen ? 'nav-chevron--open rotate-90' : undefined"
            aria-hidden="true"
          />
        </button>
        <div
          v-if="faturasOpen"
          id="nav-faturas-submenu"
          class="py-0.5 pb-1.5"
          role="group"
          aria-label="Faturas"
          data-testid="nav-submenu-faturas"
        >
          <NuxtLink
            v-for="item in faturasNavGroup.children"
            :key="item.to"
            :to="item.to"
            :class="[navLinkClass, navLinkSubClass, isActive(item.to) ? navLinkActiveClass : undefined]"
            :aria-current="isActive(item.to) ? 'page' : undefined"
          >
            <UIcon
              :name="item.icon"
              aria-hidden="true"
            />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </div>
      </div>

      <div class="my-px">
        <button
          :class="[navLinkClass, 'cursor-pointer']"
          type="button"
          :aria-expanded="devolucoesOpen"
          aria-controls="nav-devolucoes-submenu"
          data-testid="nav-group-devolucoes"
          @click="toggleDevolucoes"
        >
          <UIcon
            :name="devolucoesNavGroup.icon"
            aria-hidden="true"
          />
          <span>{{ devolucoesNavGroup.label }}</span>
          <UIcon
            name="i-lucide-chevron-right"
            class="nav-chevron !size-[13px] transition-transform duration-160 ease-in-out"
            :class="devolucoesOpen ? 'nav-chevron--open rotate-90' : undefined"
            aria-hidden="true"
          />
        </button>
        <div
          v-if="devolucoesOpen"
          id="nav-devolucoes-submenu"
          class="py-0.5 pb-1.5"
          role="group"
          aria-label="Devoluções"
          data-testid="nav-submenu-devolucoes"
        >
          <NuxtLink
            v-for="item in devolucoesNavGroup.children"
            :key="item.to"
            :to="item.to"
            :class="[navLinkClass, navLinkSubClass, isActive(item.to) ? navLinkActiveClass : undefined]"
            :aria-current="isActive(item.to) ? 'page' : undefined"
          >
            <UIcon
              :name="item.icon"
              aria-hidden="true"
            />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </div>
      </div>

      <div class="my-px">
        <button
          :class="[navLinkClass, 'cursor-pointer']"
          type="button"
          :aria-expanded="cadastrosOpen"
          aria-controls="nav-cadastros-submenu"
          data-testid="nav-group-cadastros"
          @click="toggleCadastros"
        >
          <UIcon
            :name="cadastrosNavGroup.icon"
            aria-hidden="true"
          />
          <span>{{ cadastrosNavGroup.label }}</span>
          <UIcon
            name="i-lucide-chevron-right"
            class="nav-chevron !size-[13px] transition-transform duration-160 ease-in-out"
            :class="cadastrosOpen ? 'nav-chevron--open rotate-90' : undefined"
            aria-hidden="true"
          />
        </button>
        <div
          v-if="cadastrosOpen"
          id="nav-cadastros-submenu"
          class="py-0.5 pb-1.5"
          role="group"
          aria-label="Cadastros"
          data-testid="nav-submenu-cadastros"
        >
          <NuxtLink
            v-for="item in cadastrosNavGroup.children"
            :key="item.to"
            :to="item.to"
            :class="[navLinkClass, navLinkSubClass, isActive(item.to) ? navLinkActiveClass : undefined]"
            :aria-current="isActive(item.to) ? 'page' : undefined"
          >
            <UIcon
              :name="item.icon"
              aria-hidden="true"
            />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </div>
      </div>

      <div class="my-px">
        <button
          :class="[navLinkClass, 'cursor-pointer']"
          type="button"
          :aria-expanded="configuracoesOpen"
          aria-controls="nav-configuracoes-submenu"
          data-testid="nav-group-configuracoes"
          @click="toggleConfiguracoes"
        >
          <UIcon
            :name="configuracoesNavGroup.icon"
            aria-hidden="true"
          />
          <span>{{ configuracoesNavGroup.label }}</span>
          <UIcon
            name="i-lucide-chevron-right"
            class="nav-chevron !size-[13px] transition-transform duration-160 ease-in-out"
            :class="configuracoesOpen ? 'nav-chevron--open rotate-90' : undefined"
            aria-hidden="true"
          />
        </button>
        <div
          v-if="configuracoesOpen"
          id="nav-configuracoes-submenu"
          class="py-0.5 pb-1.5"
          role="group"
          aria-label="Configurações"
          data-testid="nav-submenu-configuracoes"
        >
          <NuxtLink
            v-for="item in configuracoesNavGroup.children"
            :key="item.to"
            :to="item.to"
            :class="[navLinkClass, navLinkSubClass, isActive(item.to) ? navLinkActiveClass : undefined]"
            :aria-current="isActive(item.to) ? 'page' : undefined"
          >
            <UIcon
              :name="item.icon"
              aria-hidden="true"
            />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </div>
      </div>

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
