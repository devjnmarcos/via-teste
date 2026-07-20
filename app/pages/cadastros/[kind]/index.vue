<script setup lang="ts">
/**
 * Cadastros Onda 3 — listagens reais (exceto SLA/Fretes, que têm rotas concretas).
 */
import type { CadastroOnda3Kind } from '~/data/demo/cadastros-onda3'
import { isCadastroOnda3Kind } from '~/data/demo/cadastros-onda3'
import { resolveCadastroKind } from '~/utils/cadastros'

const route = useRoute()
const kind = computed(() => resolveCadastroKind(route.params.kind))

if (!kind.value) {
  throw createError({ statusCode: 404, statusMessage: 'Cadastro não encontrado' })
}

if (kind.value === 'sla' || kind.value === 'fretes') {
  await navigateTo(`/cadastros/${kind.value}`, { replace: true })
}

if (!isCadastroOnda3Kind(kind.value)) {
  throw createError({ statusCode: 404, statusMessage: 'Cadastro não encontrado' })
}

const onda3Kind = kind.value as CadastroOnda3Kind

useSeoMeta({ title: () => `${onda3Kind} · Cadastros · Via Reversa` })
</script>

<template>
  <CadastroOnda3Page :kind="onda3Kind" />
</template>
