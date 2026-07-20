<script setup lang="ts">
/**
 * Pedido próprio (new_own) — mesmo wizard de criação com contexto "próprio".
 */
useSeoMeta({ title: 'Novo pedido próprio · Via Reversa' })
</script>

<template>
  <div class="order-create-own-page">
    <PageHeader
      back-to="/pedidos"
      title="Criação de pedido próprio"
      subtitle="Fluxo new_own — origem vinculada à conta autenticada"
    >
      <AppButton
        to="/pedidos/novo"
        icon="i-lucide-git-compare"
        variant="ghost"
      >
        Pedido padrão
      </AppButton>
      <AppButton
        to="/pedidos"
        icon="i-lucide-x"
        variant="ghost"
      >
        Cancelar
      </AppButton>
    </PageHeader>

    <OrderCreateWizard own-order />
  </div>
</template>
