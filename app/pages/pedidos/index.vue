<script setup lang="ts">
/**
 * Listagem de pedidos + modais P2 (agendar lote / import ocorrências).
 * Mock DS — sem API.
 */
import { orders, ordersMetrics } from '~/data/demo/orders'
import {
  chatbotTemplateOptions,
  productOptions,
  schedulingChannelOptions,
  type SchedulingChannelValue
} from '~/data/demo/order-modals'
import { useToast } from '~/composables/useToast'

const toast = useToast()

const activeTab = ref('Em aberto')
const tabs = ['Em aberto · 5', 'Em rota · 1', 'Concluídos / Ocorrências · 4']
const listOrders = computed(() => orders.slice(0, 5))
const selectedIds = ref<string[]>([])

const scheduleOpen = ref(false)
const importOpen = ref(false)
const scheduleLoading = ref(false)
const importLoading = ref(false)

const chatbotOnline = ref(true)
const checkingHealth = ref(false)
const selectedChannels = ref<SchedulingChannelValue[]>(['whatsapp', 'sms'])
const selectedTemplateId = ref<string>(chatbotTemplateOptions[0]!.id)
const selectedProductId = ref<string>(productOptions[0]!.id)
const importFileName = ref('')

const selectedTemplate = computed(() =>
  chatbotTemplateOptions.find((item) => item.id === selectedTemplateId.value)
)

const channelItems = schedulingChannelOptions.map((item) => ({
  label: item.label,
  value: item.value
}))

const templateItems = chatbotTemplateOptions.map((item) => ({
  label: item.name,
  value: item.id
}))

const productItems = productOptions.map((item) => ({
  label: item.name,
  value: item.id
}))

useSeoMeta({ title: 'Pedidos · Via Reversa' })

function openSchedule() {
  if (!selectedIds.value.length) {
    toast.error('Selecione pedidos', 'Marque ao menos um pedido para agendar em lote.')
    return
  }
  scheduleOpen.value = true
}

function openImport() {
  importFileName.value = ''
  importOpen.value = true
}

async function checkChatbotHealth() {
  checkingHealth.value = true
  await new Promise((resolve) => setTimeout(resolve, 420))
  chatbotOnline.value = true
  checkingHealth.value = false
  toast.info('Chatbot verificado', 'Serviço online (mock).')
}

async function confirmSchedule() {
  if (!chatbotOnline.value) {
    toast.error('Chatbot offline', 'Verifique o status antes de enviar.')
    return
  }
  if (!selectedChannels.value.length) {
    toast.error('Canais obrigatórios', 'Selecione ao menos um canal de mensagem.')
    return
  }
  if (selectedTemplate.value?.requiresProduct && !selectedProductId.value) {
    toast.error('Produto obrigatório', 'Este template exige um produto.')
    return
  }

  scheduleLoading.value = true
  await new Promise((resolve) => setTimeout(resolve, 520))
  scheduleLoading.value = false
  scheduleOpen.value = false
  toast.success(
    'Agendamento em lote',
    `${selectedIds.value.length} pedido(s) enviados para agendamento (mock).`
  )
  selectedIds.value = []
}

function onImportFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  importFileName.value = file?.name ?? ''
}

function downloadExample() {
  toast.info('Arquivo de exemplo', 'Download mock do XLSX de ocorrências em lote.')
}

async function confirmImport() {
  if (!importFileName.value) {
    toast.error('Arquivo obrigatório', 'Selecione uma planilha .xlsx ou .xls.')
    return
  }
  importLoading.value = true
  await new Promise((resolve) => setTimeout(resolve, 480))
  importLoading.value = false
  importOpen.value = false
  toast.success('Importação enviada', `Ocorrências de “${importFileName.value}” processadas (mock).`)
  importFileName.value = ''
}
</script>

<template>
  <div>
    <PageHeader title="Pedidos" subtitle="Listagem completa por recorte de status">
      <AppButton
        icon="i-lucide-upload"
        @click="openImport"
      >
        Importar ocorrências
      </AppButton>
      <AppButton icon="i-lucide-download">Exportar XLSX</AppButton>
      <AppButton
        to="/pedidos/novo"
        icon="i-lucide-plus"
        variant="primary"
      >
        Criar pedido
      </AppButton>
    </PageHeader>

    <MetricsStrip :metrics="ordersMetrics" />

    <nav
      class="flex min-h-[49px] gap-6 border-b border-via-line px-[18px]"
      aria-label="Recortes de pedidos"
    >
      <button
        v-for="tab in tabs"
        :key="tab"
        type="button"
        class="inline-flex cursor-pointer items-center border-0 border-b-2 border-transparent bg-transparent text-xs text-via-muted transition-[color,border-color] duration-150"
        :class="tab.startsWith(activeTab) ? 'border-via-blue font-bold text-via-ink' : undefined"
        @click="activeTab = tab.split(' · ')[0]!"
      >
        {{ tab }}
      </button>
    </nav>

    <section
      class="flex min-h-[58px] items-center gap-2 border-b border-via-line px-[18px] py-[9px] [&_button]:cursor-pointer"
      aria-label="Filtros de pedidos"
    >
      <UInput
        icon="i-lucide-search"
        placeholder="Buscar por código ou cliente..."
        class="w-[265px] [&_input]:h-9 [&_input]:border-via-line-strong [&_input]:bg-via-surface-2 [&_input]:text-[11px]"
      />
      <AppButton icon="i-lucide-route">Operação</AppButton>
      <AppButton icon="i-lucide-calendar-range">Período</AppButton>
      <AppButton icon="i-lucide-list-filter">Mais filtros · 3</AppButton>
      <span class="flex-1" />
      <UButton
        icon="i-lucide-columns-3"
        color="primary"
        variant="link"
      >
        Configurar colunas
      </UButton>
    </section>

    <section
      v-if="selectedIds.length"
      class="flex min-h-12 items-center gap-2 border-b border-via-line bg-[color-mix(in_oklab,var(--via-blue-soft)_45%,var(--via-surface))] px-[18px]"
      aria-label="Ações em lote"
    >
      <strong class="text-xs text-via-ink">{{ selectedIds.length }} selecionado(s)</strong>
      <AppButton
        icon="i-lucide-calendar-check"
        variant="primary"
        @click="openSchedule"
      >
        Agendar em lote
      </AppButton>
      <AppButton
        variant="ghost"
        @click="selectedIds = []"
      >
        Limpar seleção
      </AppButton>
    </section>

    <OrdersTable
      v-model:selected="selectedIds"
      :orders="listOrders"
      selectable
    />

    <AppModal
      v-model:open="scheduleOpen"
      variant="form"
      title="Processar pedidos para agendamento"
      :description="`${selectedIds.length} pedido(s) serão enviados. Este processo não é rápido — aguarde o loading.`"
      confirm-label="Enviar"
      confirm-variant="primary"
      :loading="scheduleLoading"
      @confirm="confirmSchedule"
    >
      <div class="flex flex-wrap items-center gap-2 text-xs">
        <span
          class="inline-block size-2.5 rounded-full"
          :class="chatbotOnline ? 'bg-via-green' : 'bg-via-red'"
          aria-hidden="true"
        />
        <strong>Chatbot: {{ chatbotOnline ? 'ON' : 'OFF' }}</strong>
        <AppButton
          icon="i-lucide-refresh-cw"
          :disabled="checkingHealth"
          @click="checkChatbotHealth"
        >
          {{ checkingHealth ? 'Verificando…' : 'Verificar agora' }}
        </AppButton>
      </div>

      <AppFormField label="Canais das mensagens *">
        <USelectMenu
          v-model="selectedChannels"
          multiple
          value-key="value"
          :items="channelItems"
          placeholder="Selecione os canais"
        />
      </AppFormField>

      <AppFormField label="Template do Chatbot">
        <USelectMenu
          v-model="selectedTemplateId"
          value-key="value"
          :items="templateItems"
        />
      </AppFormField>

      <AppFormField
        v-if="selectedTemplate?.requiresProduct"
        label="Produto *"
      >
        <USelectMenu
          v-model="selectedProductId"
          value-key="value"
          :items="productItems"
        />
      </AppFormField>
    </AppModal>

    <AppModal
      v-model:open="importOpen"
      variant="form"
      title="Inserir ocorrências em lote"
      description="Envie uma planilha XLSX/XLS com ocorrências para atualizar pedidos em massa."
      confirm-label="Enviar"
      :loading="importLoading"
      @confirm="confirmImport"
    >
      <AppFormField label="Planilha *">
        <input
          type="file"
          accept=".xlsx,.xls"
          class="block w-full cursor-pointer text-xs text-via-muted file:mr-3 file:cursor-pointer file:rounded-via-control file:border file:border-via-line-strong file:bg-via-surface-2 file:px-3 file:py-2 file:text-xs file:font-[650] file:text-via-ink"
          @change="onImportFileChange"
        >
        <p
          v-if="importFileName"
          class="m-0 mt-1.5 text-[11px] text-via-ink"
        >
          Selecionado: {{ importFileName }}
        </p>
      </AppFormField>

      <div class="flex flex-wrap gap-3 text-xs">
        <button
          type="button"
          class="cursor-pointer border-0 bg-transparent p-0 font-[650] text-via-blue-strong hover:underline"
          @click="downloadExample"
        >
          Baixar arquivo de exemplo
        </button>
        <span class="text-via-muted">Histórico de erros (P3)</span>
      </div>
    </AppModal>
  </div>
</template>
