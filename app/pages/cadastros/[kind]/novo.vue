<script setup lang="ts">
/**
 * Formulários de página do scaffolding antigo — desativados.
 * Piloto SLA/Fretes usa modal; demais cadastros ainda não têm create.
 */
import { getCadastroMeta } from '~/data/demo/cadastros'
import { resolveCadastroKind } from '~/utils/cadastros'

const route = useRoute()
const kind = computed(() => resolveCadastroKind(route.params.kind))

if (!kind.value) {
  throw createError({ statusCode: 404, statusMessage: 'Cadastro não encontrado' })
}

const meta = computed(() => getCadastroMeta(kind.value!))

useSeoMeta({ title: () => `Novo · ${meta.value.label} · Via Reversa` })
</script>

<template>
  <div>
    <PageHeader
      :back-to="`/cadastros/${kind}`"
      :title="`Novo · ${meta.label}`"
      :subtitle="meta.description"
    />
    <EmptyState
      title="Criação em página indisponível"
      description="Neste ciclo, create/edit curto usa AppModal (ver SLA e Fretes). Formulários longos em página entram na onda 3."
      icon="i-lucide-panel-top"
    />
  </div>
</template>
