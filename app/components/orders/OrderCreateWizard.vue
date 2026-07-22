<script setup lang="ts">
import type { OrderCreateForm } from '../../types/order-create'
import {
  addressRoleLabel,
  carrierLabel,
  clientLabel,
  createEmptyOrderForm,
  createEmptyOrderItem,
  formatMoneyBr,
  orderCreateCarriers,
  orderCreateClients,
  orderCreateProducts,
  orderCreateSteps,
  orderKindLabel,
  orderKindOptions,
  productLabel
} from '../../data/demo/order-create'
import { validateOrderCreateStep } from '../../utils/order-create-validation'

const toast = useToast()

const props = withDefaults(
  defineProps<{
    /** Fluxo new_own — cliente pré-selecionado como a conta autenticada. */
    ownOrder?: boolean
  }>(),
  { ownOrder: false }
)

const form = reactive<OrderCreateForm>(createEmptyOrderForm())
if (props.ownOrder) {
  form.accountId = orderCreateClients[0]?.id ?? ''
}
const stepIndex = ref(0)
const errors = ref<Record<string, string>>({})
const submitted = ref(false)
const submitting = ref(false)
const transitionName = ref('via-step-forward')

const currentStep = computed(() => orderCreateSteps[stepIndex.value]!)
const isFirst = computed(() => stepIndex.value === 0)
const isLast = computed(() => stepIndex.value === orderCreateSteps.length - 1)

const clientItems = orderCreateClients.map((c) => ({ label: c.name, value: c.id }))
const kindItems = orderKindOptions.map((k) => ({ label: k.label, value: k.value }))
const carrierItems = orderCreateCarriers.map((c) => ({ label: `${c.name} · ${c.type}`, value: c.id }))
const productItems = orderCreateProducts.map((p) => ({ label: `${p.name} — ${p.detail}`, value: p.id }))

const itemsTotal = computed(() =>
  form.items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0)
)

function fieldError(key: string): string | undefined {
  return submitted.value ? errors.value[key] : undefined
}

function validateCurrent(): boolean {
  submitted.value = true
  errors.value = validateOrderCreateStep(currentStep.value.id, form)
  return Object.keys(errors.value).length === 0
}

function goTo(index: number, direction: 'forward' | 'back') {
  transitionName.value = direction === 'forward' ? 'via-step-forward' : 'via-step-back'
  stepIndex.value = index
  submitted.value = false
  errors.value = {}
}

function onNext() {
  if (!validateCurrent()) {
    toast.error('Revise os campos obrigatórios', 'Corrija os erros destacados antes de avançar.')
    return
  }
  if (!isLast.value) {
    goTo(stepIndex.value + 1, 'forward')
  }
}

function onBack() {
  if (!isFirst.value) {
    goTo(stepIndex.value - 1, 'back')
  }
}

function addItem() {
  form.items.push(createEmptyOrderItem())
}

function removeItem(index: number) {
  form.items.splice(index, 1)
}

async function onSubmit() {
  if (!validateCurrent()) {
    toast.error('Pedido incompleto', 'Há campos inválidos na revisão. Volte e corrija.')
    return
  }
  submitting.value = true
  await new Promise((resolve) => setTimeout(resolve, 450))
  submitting.value = false
  toast.success(
    props.ownOrder ? 'Pedido próprio criado' : 'Pedido criado',
    'O pedido foi registrado com sucesso (mock).'
  )
  await navigateTo('/pedidos')
}
</script>

<template>
  <div class="flex min-h-[calc(100%-88px)] flex-col" data-testid="order-create-wizard">
    <p
      v-if="ownOrder"
      class="border-b border-via-line bg-via-surface-2 px-app-gutter py-2 text-[11px] text-via-muted"
    >
      Modo pedido próprio — cliente pré-selecionado como a conta autenticada (mock).
    </p>
    <OrderCreateStepper :steps="orderCreateSteps" :current-index="stepIndex" />

    <div class="flex-1 px-app-gutter pt-[18px] pb-6">
      <Transition :name="transitionName" mode="out-in">
        <section :key="currentStep.id" class="order-wizard__panel" :aria-labelledby="`step-${currentStep.id}`">
          <header class="mb-4">
            <h2 :id="`step-${currentStep.id}`">{{ currentStep.label }}</h2>
            <p>{{ currentStep.description }}</p>
          </header>

          <!-- Cliente -->
          <div v-if="currentStep.id === 'cliente'" class="grid max-w-[920px] grid-cols-2 gap-x-4 gap-y-3.5 max-[800px]:grid-cols-1">
            <label class="col-span-full grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
              <span>Cliente <abbr title="Obrigatório">*</abbr></span>
              <USelectMenu
                v-model="form.accountId"
                value-key="value"
                :items="clientItems"
                placeholder="Selecione o cliente..."
              />
              <small v-if="fieldError('accountId')" class="text-[11px] text-via-red">{{ fieldError('accountId') }}</small>
            </label>
          </div>

          <!-- Operação -->
          <div v-else-if="currentStep.id === 'operacao'" class="grid max-w-[920px] grid-cols-2 gap-x-4 gap-y-3.5 max-[800px]:grid-cols-1">
            <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
              <span>Tipo de operação <abbr title="Obrigatório">*</abbr></span>
              <USelectMenu
                v-model="form.kindCtrl"
                value-key="value"
                :items="kindItems"
                placeholder="Selecione"
              />
              <small v-if="fieldError('kindCtrl')" class="text-[11px] text-via-red">{{ fieldError('kindCtrl') }}</small>
            </label>
            <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
              <span>Data de agendamento <abbr title="Obrigatório">*</abbr></span>
              <UInput v-model="form.scheduledAt" type="date" />
              <small v-if="fieldError('scheduledAt')" class="text-[11px] text-via-red">{{ fieldError('scheduledAt') }}</small>
            </label>
            <label class="col-span-full grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
              <span>Transportador <abbr title="Obrigatório">*</abbr></span>
              <USelectMenu
                v-model="form.carrierId"
                value-key="value"
                :items="carrierItems"
                placeholder="Selecione o transportador..."
              />
              <small v-if="fieldError('carrierId')" class="text-[11px] text-via-red">{{ fieldError('carrierId') }}</small>
            </label>
          </div>

          <!-- Endereço -->
          <div v-else-if="currentStep.id === 'endereco'">
            <OrderAddressFields
              v-model="form.address"
              :errors="submitted ? errors : {}"
              :show-extra-fields="form.kindCtrl === 'OE'"
            />
          </div>

          <!-- Itens -->
          <div v-else-if="currentStep.id === 'itens'" class="items-step">
            <div class="mb-3.5 flex max-w-[920px] items-center justify-between gap-3">
              <p>Adicione os itens para cálculo do valor do frete e seguro.</p>
              <AppButton icon="i-lucide-plus" variant="primary" @click="addItem">Adicionar item</AppButton>
            </div>

            <p v-if="fieldError('items')" class="mb-3 text-[11px] text-via-red">{{ fieldError('items') }}</p>

            <EmptyState
              v-if="!form.items.length"
              title="Nenhum item adicionado"
              description="Inclua ao menos um volume com produto, quantidade, preço, dimensões e peso."
              icon="i-lucide-package"
            />

            <article
              v-for="(item, index) in form.items"
              :key="item.id"
              class="mb-3.5 max-w-[920px] border-t border-via-line pt-3.5 pb-1"
            >
              <header class="mb-3 flex items-center justify-between">
                <h3>Item {{ index + 1 }}</h3>
                <AppButton
                  icon="i-lucide-trash-2"
                  variant="ghost"
                  aria-label="Remover item"
                  @click="removeItem(index)"
                />
              </header>
              <div class="grid max-w-[920px] grid-cols-2 gap-x-4 gap-y-3.5 max-[800px]:grid-cols-1">
                <label class="col-span-full grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
                  <span>Produto <abbr title="Obrigatório">*</abbr></span>
                  <USelectMenu
                    v-model="item.productId"
                    value-key="value"
                    :items="productItems"
                    placeholder="Selecione o produto..."
                  />
                  <small v-if="fieldError(`items.${index}.productId`)" class="text-[11px] text-via-red">
                    {{ fieldError(`items.${index}.productId`) }}
                  </small>
                </label>
                <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
                  <span>Quantidade <abbr title="Obrigatório">*</abbr></span>
                  <UInput v-model.number="item.quantity" type="number" min="1" />
                  <small v-if="fieldError(`items.${index}.quantity`)" class="text-[11px] text-via-red">
                    {{ fieldError(`items.${index}.quantity`) }}
                  </small>
                </label>
                <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
                  <span>Preço (R$) <abbr title="Obrigatório">*</abbr></span>
                  <UInput v-model.number="item.price" type="number" min="1" step="0.01" />
                  <small v-if="fieldError(`items.${index}.price`)" class="text-[11px] text-via-red">
                    {{ fieldError(`items.${index}.price`) }}
                  </small>
                </label>
                <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
                  <span>Largura (cm) <abbr title="Obrigatório">*</abbr></span>
                  <UInput v-model.number="item.sizeX" type="number" min="1" />
                  <small v-if="fieldError(`items.${index}.sizeX`)" class="text-[11px] text-via-red">
                    {{ fieldError(`items.${index}.sizeX`) }}
                  </small>
                </label>
                <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
                  <span>Altura (cm) <abbr title="Obrigatório">*</abbr></span>
                  <UInput v-model.number="item.sizeY" type="number" min="1" />
                  <small v-if="fieldError(`items.${index}.sizeY`)" class="text-[11px] text-via-red">
                    {{ fieldError(`items.${index}.sizeY`) }}
                  </small>
                </label>
                <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
                  <span>Profundidade (cm) <abbr title="Obrigatório">*</abbr></span>
                  <UInput v-model.number="item.sizeZ" type="number" min="1" />
                  <small v-if="fieldError(`items.${index}.sizeZ`)" class="text-[11px] text-via-red">
                    {{ fieldError(`items.${index}.sizeZ`) }}
                  </small>
                </label>
                <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
                  <span>Peso (kg) <abbr title="Obrigatório">*</abbr></span>
                  <UInput v-model.number="item.weight" type="number" min="1" step="0.1" />
                  <small v-if="fieldError(`items.${index}.weight`)" class="text-[11px] text-via-red">
                    {{ fieldError(`items.${index}.weight`) }}
                  </small>
                </label>
                <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
                  <span>Serial</span>
                  <UInput v-model="item.serialNumber" />
                </label>
                <label class="col-span-full grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted">
                  <span>Observação</span>
                  <UTextarea v-model="item.notes" :rows="2" placeholder="Observações sobre o item (opcional)" />
                </label>
              </div>
            </article>
          </div>

          <!-- Revisão -->
          <div v-else class="review-step">
            <dl class="mb-5 grid max-w-[920px] grid-cols-2 gap-x-5 gap-y-3 max-[800px]:grid-cols-1">
              <div>
                <dt>Cliente</dt>
                <dd>{{ clientLabel(form.accountId) }}</dd>
              </div>
              <div>
                <dt>Tipo de operação</dt>
                <dd>{{ orderKindLabel(form.kindCtrl) }}</dd>
              </div>
              <div>
                <dt>Agendamento</dt>
                <dd>{{ form.scheduledAt || '—' }}</dd>
              </div>
              <div>
                <dt>Transportador</dt>
                <dd>{{ carrierLabel(form.carrierId) }}</dd>
              </div>
              <div>
                <dt>{{ addressRoleLabel(form.kindCtrl) }}</dt>
                <dd>
                  {{ form.address.name }} · {{ form.address.address }}, {{ form.address.number }} —
                  {{ form.address.city }}/{{ form.address.stateCode }}
                </dd>
              </div>
              <div>
                <dt>Itens</dt>
                <dd>{{ form.items.length }} volume(s) · total {{ formatMoneyBr(itemsTotal) }}</dd>
              </div>
              <div>
                <dt>Frete</dt>
                <dd>Cálculo mock — será ligado à API na próxima onda</dd>
              </div>
            </dl>

            <table class="w-full max-w-[920px] border-collapse text-xs [&_td]:border-b [&_td]:border-via-line [&_td]:px-2.5 [&_td]:py-2 [&_td]:text-left [&_th]:border-b [&_th]:border-via-line [&_th]:bg-via-surface-2 [&_th]:px-2.5 [&_th]:py-2 [&_th]:text-left [&_th]:text-[10px] [&_th]:font-bold [&_th]:tracking-[0.04em] [&_th]:text-via-subtle [&_th]:uppercase">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Qtd</th>
                  <th>Dimensões</th>
                  <th>Peso</th>
                  <th>Preço</th>
                  <th>Observação</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in form.items" :key="item.id">
                  <td>{{ productLabel(item.productId) }}</td>
                  <td class="numeric">{{ item.quantity }}</td>
                  <td class="numeric">{{ item.sizeX }}×{{ item.sizeY }}×{{ item.sizeZ }} cm</td>
                  <td class="numeric">{{ item.weight }} kg</td>
                  <td class="numeric">{{ formatMoneyBr(item.price) }}</td>
                  <td>{{ item.notes || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </Transition>
    </div>

    <footer class="flex min-h-16 items-center gap-2 border-t border-via-line bg-via-surface px-app-gutter py-2.5">
      <AppButton
        v-if="!isFirst"
        type="button"
        icon="i-lucide-arrow-left"
        @click="onBack"
      >
        Voltar
      </AppButton>
      <span class="flex-1" />
      <AppButton
        v-if="!isLast"
        type="button"
        variant="primary"
        icon="i-lucide-arrow-right"
        data-testid="order-wizard-next"
        @click="onNext"
      >
        Próximo
      </AppButton>
      <AppButton
        v-else
        type="button"
        variant="primary"
        icon="i-lucide-check"
        :disabled="submitting"
        data-testid="order-wizard-submit"
        @click="onSubmit"
      >
        {{ submitting ? 'Enviando…' : 'Concluir' }}
      </AppButton>
    </footer>
  </div>
</template>
