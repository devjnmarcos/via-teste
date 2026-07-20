<script setup lang="ts">
import type { OrderAddressParty, OrderCreateForm } from '../../types/order-create'
import {
  brazilianStates,
  clientLabel,
  createEmptyOrderForm,
  createEmptyOrderItem,
  formatMoneyBr,
  orderCreateClients,
  orderCreateSteps,
  orderKindLabel,
  orderKindOptions
} from '../../data/demo/order-create'
import { validateOrderCreateStep } from '../../utils/order-create-validation'

const toast = useToast()

const props = withDefaults(
  defineProps<{
    /** Fluxo new_own — conta autenticada como origem. */
    ownOrder?: boolean
  }>(),
  { ownOrder: false }
)

const form = reactive<OrderCreateForm>(createEmptyOrderForm())
if (props.ownOrder) {
  form.clientId = orderCreateClients[0]?.id ?? ''
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
const stateItems = brazilianStates

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

function partyField(
  party: 'origin' | 'destiny',
  key: keyof OrderAddressParty
): string {
  return `${party}.${key}`
}
</script>

<template>
  <div class="flex min-h-[calc(100%-88px)] flex-col" data-testid="order-create-wizard">
    <p
      v-if="ownOrder"
      class="border-b border-via-line bg-via-surface-2 px-app-gutter py-2 text-[11px] text-via-muted"
    >
      Modo pedido próprio — origem pré-preenchida com a conta autenticada (mock).
    </p>
    <OrderCreateStepper :steps="orderCreateSteps" :current-index="stepIndex" />

    <div class="flex-1 px-app-gutter pt-[18px] pb-6">
      <Transition :name="transitionName" mode="out-in">
        <section :key="currentStep.id" class="order-wizard__panel" :aria-labelledby="`step-${currentStep.id}`">
          <header class="mb-4">
            <h2 :id="`step-${currentStep.id}`">{{ currentStep.label }}</h2>
            <p>{{ currentStep.description }}</p>
          </header>

          <!-- Operação -->
          <div v-if="currentStep.id === 'operacao'" class="grid max-w-[920px] grid-cols-2 gap-x-4 gap-y-3.5 max-[800px]:grid-cols-1">
            <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
              <span>Tipo de pedido <abbr title="Obrigatório">*</abbr></span>
              <USelectMenu
                v-model="form.kindCtrl"
                value-key="value"
                :items="kindItems"
                placeholder="Selecione"
              />
              <small v-if="fieldError('kindCtrl')" class="text-[11px] text-via-red">{{ fieldError('kindCtrl') }}</small>
            </label>
            <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
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

          <!-- Origem / Destino -->
          <template v-else-if="currentStep.id === 'origem' || currentStep.id === 'destino'">
            <div class="grid max-w-[920px] grid-cols-2 gap-x-4 gap-y-3.5 max-[800px]:grid-cols-1">
              <label class="col-span-full grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
                <span>Nome <abbr title="Obrigatório">*</abbr></span>
                <UInput
                  v-model="form[currentStep.id === 'origem' ? 'origin' : 'destiny'].name"
                  :class="{ 'is-invalid': fieldError(partyField(currentStep.id === 'origem' ? 'origin' : 'destiny', 'name')) }"
                />
                <small
                  v-if="fieldError(partyField(currentStep.id === 'origem' ? 'origin' : 'destiny', 'name'))"
                  class="text-[11px] text-via-red"
                >{{ fieldError(partyField(currentStep.id === 'origem' ? 'origin' : 'destiny', 'name')) }}</small>
              </label>

              <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
                <span>Celular <abbr title="Obrigatório">*</abbr></span>
                <UInput
                  v-model="form[currentStep.id === 'origem' ? 'origin' : 'destiny'].cellphone"
                  placeholder="(00) 00000-0000"
                />
                <small
                  v-if="fieldError(partyField(currentStep.id === 'origem' ? 'origin' : 'destiny', 'cellphone'))"
                  class="text-[11px] text-via-red"
                >{{ fieldError(partyField(currentStep.id === 'origem' ? 'origin' : 'destiny', 'cellphone')) }}</small>
              </label>

              <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
                <span>
                  {{ form[currentStep.id === 'origem' ? 'origin' : 'destiny'].isCompany ? 'CNPJ' : 'CPF' }}
                  <abbr title="Obrigatório">*</abbr>
                </span>
                <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                  <UInput
                    v-model="form[currentStep.id === 'origem' ? 'origin' : 'destiny'].federalId"
                    :placeholder="form[currentStep.id === 'origem' ? 'origin' : 'destiny'].isCompany ? '00.000.000/0000-00' : '000.000.000-00'"
                  />
                  <div class="inline-flex overflow-hidden rounded-via-control border border-via-line-strong" role="group" aria-label="Tipo de documento">
                    <button
                      type="button"
                      class="min-h-9 cursor-pointer border-0 bg-via-surface-2 px-3 text-[11px] font-[650] text-via-muted"
                      :class="!form[currentStep.id === 'origem' ? 'origin' : 'destiny'].isCompany ? 'bg-via-blue text-via-surface' : undefined"
                      @click="form[currentStep.id === 'origem' ? 'origin' : 'destiny'].isCompany = false"
                    >CPF</button>
                    <button
                      type="button"
                      class="min-h-9 cursor-pointer border-0 bg-via-surface-2 px-3 text-[11px] font-[650] text-via-muted"
                      :class="form[currentStep.id === 'origem' ? 'origin' : 'destiny'].isCompany ? 'bg-via-blue text-via-surface' : undefined"
                      @click="form[currentStep.id === 'origem' ? 'origin' : 'destiny'].isCompany = true"
                    >CNPJ</button>
                  </div>
                </div>
                <small
                  v-if="fieldError(partyField(currentStep.id === 'origem' ? 'origin' : 'destiny', 'federalId'))"
                  class="text-[11px] text-via-red"
                >{{ fieldError(partyField(currentStep.id === 'origem' ? 'origin' : 'destiny', 'federalId')) }}</small>
              </label>

              <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
                <span>CEP <abbr title="Obrigatório">*</abbr></span>
                <UInput
                  v-model="form[currentStep.id === 'origem' ? 'origin' : 'destiny'].zipCode"
                  placeholder="00000-000"
                />
                <small
                  v-if="fieldError(partyField(currentStep.id === 'origem' ? 'origin' : 'destiny', 'zipCode'))"
                  class="text-[11px] text-via-red"
                >{{ fieldError(partyField(currentStep.id === 'origem' ? 'origin' : 'destiny', 'zipCode')) }}</small>
              </label>

              <label class="col-span-full grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
                <span>Logradouro <abbr title="Obrigatório">*</abbr></span>
                <UInput v-model="form[currentStep.id === 'origem' ? 'origin' : 'destiny'].address" />
                <small
                  v-if="fieldError(partyField(currentStep.id === 'origem' ? 'origin' : 'destiny', 'address'))"
                  class="text-[11px] text-via-red"
                >{{ fieldError(partyField(currentStep.id === 'origem' ? 'origin' : 'destiny', 'address')) }}</small>
              </label>

              <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
                <span>Número <abbr title="Obrigatório">*</abbr></span>
                <UInput v-model="form[currentStep.id === 'origem' ? 'origin' : 'destiny'].number" />
                <small
                  v-if="fieldError(partyField(currentStep.id === 'origem' ? 'origin' : 'destiny', 'number'))"
                  class="text-[11px] text-via-red"
                >{{ fieldError(partyField(currentStep.id === 'origem' ? 'origin' : 'destiny', 'number')) }}</small>
              </label>

              <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
                <span>Bairro <abbr title="Obrigatório">*</abbr></span>
                <UInput v-model="form[currentStep.id === 'origem' ? 'origin' : 'destiny'].quarter" />
                <small
                  v-if="fieldError(partyField(currentStep.id === 'origem' ? 'origin' : 'destiny', 'quarter'))"
                  class="text-[11px] text-via-red"
                >{{ fieldError(partyField(currentStep.id === 'origem' ? 'origin' : 'destiny', 'quarter')) }}</small>
              </label>

              <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
                <span>Cidade <abbr title="Obrigatório">*</abbr></span>
                <UInput v-model="form[currentStep.id === 'origem' ? 'origin' : 'destiny'].city" />
                <small
                  v-if="fieldError(partyField(currentStep.id === 'origem' ? 'origin' : 'destiny', 'city'))"
                  class="text-[11px] text-via-red"
                >{{ fieldError(partyField(currentStep.id === 'origem' ? 'origin' : 'destiny', 'city')) }}</small>
              </label>

              <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
                <span>UF <abbr title="Obrigatório">*</abbr></span>
                <USelectMenu
                  v-model="form[currentStep.id === 'origem' ? 'origin' : 'destiny'].stateCode"
                  value-key="value"
                  :items="stateItems"
                  placeholder="UF"
                />
                <small
                  v-if="fieldError(partyField(currentStep.id === 'origem' ? 'origin' : 'destiny', 'stateCode'))"
                  class="text-[11px] text-via-red"
                >{{ fieldError(partyField(currentStep.id === 'origem' ? 'origin' : 'destiny', 'stateCode')) }}</small>
              </label>

              <template v-if="currentStep.id === 'destino'">
                <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
                  <span>Referência</span>
                  <UInput v-model="form.destiny.reference" />
                </label>
                <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
                  <span>Informação adicional</span>
                  <UInput v-model="form.destiny.additional" />
                </label>
              </template>
            </div>
          </template>

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
              description="Inclua ao menos um volume com descrição, quantidade, preço, dimensões e peso."
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
                  <span>Descrição <abbr title="Obrigatório">*</abbr></span>
                  <UInput v-model="item.description" />
                  <small v-if="fieldError(`items.${index}.description`)" class="text-[11px] text-via-red">
                    {{ fieldError(`items.${index}.description`) }}
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
              </div>
            </article>
          </div>

          <!-- Revisão -->
          <div v-else class="review-step">
            <dl class="mb-5 grid max-w-[920px] grid-cols-2 gap-x-5 gap-y-3 max-[800px]:grid-cols-1">
              <div>
                <dt>Tipo</dt>
                <dd>{{ orderKindLabel(form.kindCtrl) }}</dd>
              </div>
              <div>
                <dt>Cliente</dt>
                <dd>{{ clientLabel(form.accountId) }}</dd>
              </div>
              <div>
                <dt>Origem</dt>
                <dd>
                  {{ form.origin.name }} · {{ form.origin.address }}, {{ form.origin.number }} —
                  {{ form.origin.city }}/{{ form.origin.stateCode }}
                </dd>
              </div>
              <div>
                <dt>Destino</dt>
                <dd>
                  {{ form.destiny.name }} · {{ form.destiny.address }}, {{ form.destiny.number }} —
                  {{ form.destiny.city }}/{{ form.destiny.stateCode }}
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
                  <th>Descrição</th>
                  <th>Qtd</th>
                  <th>Dimensões</th>
                  <th>Peso</th>
                  <th>Preço</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in form.items" :key="item.id">
                  <td>{{ item.description }}</td>
                  <td class="numeric">{{ item.quantity }}</td>
                  <td class="numeric">{{ item.sizeX }}×{{ item.sizeY }}×{{ item.sizeZ }} cm</td>
                  <td class="numeric">{{ item.weight }} kg</td>
                  <td class="numeric">{{ formatMoneyBr(item.price) }}</td>
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

