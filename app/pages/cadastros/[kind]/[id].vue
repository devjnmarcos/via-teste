<script setup lang="ts">
import { getCadastroMeta } from '~/data/demo/cadastros'
import { resolveCadastroKind } from '~/utils/cadastros'

const route = useRoute()
const kind = computed(() => resolveCadastroKind(route.params.kind))

if (!kind.value) {
  throw createError({ statusCode: 404, statusMessage: 'Cadastro não encontrado' })
}

const meta = computed(() => getCadastroMeta(kind.value!))

useSeoMeta({ title: () => `Editar · ${meta.value.label} · Via Reversa` })
</script>

<template>
  <div>
    <PageHeader
      :back-to="`/cadastros/${kind}`"
      :title="`Editar · ${meta.label}`"
      :subtitle="meta.description"
    />
    <EmptyState
      title="Edição em página indisponível"
      description="Neste ciclo, create/edit curto usa AppModal (ver SLA e Fretes)."
      icon="i-lucide-panel-top"
    />
  </div>
</template>
