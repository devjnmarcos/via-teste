<script setup lang="ts">
useSeoMeta({ title: 'Novo pedido · Via Reversa' })
</script>

<template>
  <div class="order-create-page">
    <PageHeader
      back-to="/pedidos"
      title="Criação de pedido"
      subtitle="Origem, destino e itens em etapas — espelhando o fluxo legado"
    >
      <AppButton to="/pedidos" icon="i-lucide-x" variant="ghost">Cancelar</AppButton>
    </PageHeader>

    <OrderCreateWizard />
  </div>
</template>
