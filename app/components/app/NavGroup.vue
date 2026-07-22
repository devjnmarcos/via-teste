<script setup lang="ts">
import type { NavigationItem } from './navigation'

const props = defineProps<{
  label: string
  icon: string
  children: NavigationItem[]
  testId: string
  navLinkClass: string
  navLinkActiveClass: string
  navLinkSubClass: string
}>()

const route = useRoute()

function isActive(to: string | undefined) {
  if (!to) return false
  return route.path === to || route.path.startsWith(`${to}/`)
}

function groupHasActiveChild() {
  return props.children.some((item) => isActive(item.to))
}

const open = ref(groupHasActiveChild())

watch(
  () => route.path,
  () => {
    if (groupHasActiveChild()) open.value = true
  }
)

function toggle() {
  open.value = !open.value
}
</script>

<template>
  <div class="my-px">
    <button
      :class="[navLinkClass, 'cursor-pointer']"
      type="button"
      :aria-expanded="open"
      :aria-controls="`nav-${testId}-submenu`"
      :data-testid="`nav-group-${testId}`"
      @click="toggle"
    >
      <UIcon
        :name="icon"
        aria-hidden="true"
      />
      <span>{{ label }}</span>
      <UIcon
        name="i-lucide-chevron-right"
        class="nav-chevron !size-[13px] transition-transform duration-160 ease-in-out"
        :class="open ? 'nav-chevron--open rotate-90' : undefined"
        aria-hidden="true"
      />
    </button>
    <div
      v-if="open"
      :id="`nav-${testId}-submenu`"
      class="py-0.5 pb-1.5"
      role="group"
      :aria-label="label"
      :data-testid="`nav-submenu-${testId}`"
    >
      <NuxtLink
        v-for="item in children"
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
</template>
