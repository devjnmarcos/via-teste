<script setup lang="ts">
import type { FieldErrors, OrderAddressParty } from '../../types/order-create'
import { brazilianStates } from '../../data/demo/order-create'

const props = defineProps<{
  errors: FieldErrors
  showExtraFields?: boolean
}>()

const address = defineModel<OrderAddressParty>({ required: true })

const stateItems = brazilianStates

function fieldError(key: string): string | undefined {
  return props.errors[`address.${key}`]
}
</script>

<template>
  <div class="grid max-w-[920px] grid-cols-2 gap-x-4 gap-y-3.5 max-[800px]:grid-cols-1">
    <label class="col-span-full grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
      <span>Nome <abbr title="Obrigatório">*</abbr></span>
      <UInput
        v-model="address.name"
        :class="{ 'is-invalid': fieldError('name') }"
      />
      <small v-if="fieldError('name')" class="text-[11px] text-via-red">{{ fieldError('name') }}</small>
    </label>

    <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
      <span>Celular <abbr title="Obrigatório">*</abbr></span>
      <UInput v-model="address.cellphone" placeholder="(00) 00000-0000" />
      <small v-if="fieldError('cellphone')" class="text-[11px] text-via-red">{{ fieldError('cellphone') }}</small>
    </label>

    <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
      <span>
        {{ address.isCompany ? 'CNPJ' : 'CPF' }}
        <abbr title="Obrigatório">*</abbr>
      </span>
      <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
        <UInput
          v-model="address.federalId"
          :placeholder="address.isCompany ? '00.000.000/0000-00' : '000.000.000-00'"
        />
        <div class="inline-flex overflow-hidden rounded-via-control border border-via-line-strong" role="group" aria-label="Tipo de documento">
          <button
            type="button"
            class="min-h-9 cursor-pointer border-0 bg-via-surface-2 px-3 text-[11px] font-[650] text-via-muted"
            :class="!address.isCompany ? 'bg-via-blue text-via-surface' : undefined"
            @click="address.isCompany = false"
          >CPF</button>
          <button
            type="button"
            class="min-h-9 cursor-pointer border-0 bg-via-surface-2 px-3 text-[11px] font-[650] text-via-muted"
            :class="address.isCompany ? 'bg-via-blue text-via-surface' : undefined"
            @click="address.isCompany = true"
          >CNPJ</button>
        </div>
      </div>
      <small v-if="fieldError('federalId')" class="text-[11px] text-via-red">{{ fieldError('federalId') }}</small>
    </label>

    <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
      <span>CEP <abbr title="Obrigatório">*</abbr></span>
      <UInput v-model="address.zipCode" placeholder="00000-000" />
      <small v-if="fieldError('zipCode')" class="text-[11px] text-via-red">{{ fieldError('zipCode') }}</small>
    </label>

    <label class="col-span-full grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
      <span>Logradouro <abbr title="Obrigatório">*</abbr></span>
      <UInput v-model="address.address" />
      <small v-if="fieldError('address')" class="text-[11px] text-via-red">{{ fieldError('address') }}</small>
    </label>

    <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
      <span>Número <abbr title="Obrigatório">*</abbr></span>
      <UInput v-model="address.number" />
      <small v-if="fieldError('number')" class="text-[11px] text-via-red">{{ fieldError('number') }}</small>
    </label>

    <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
      <span>Bairro <abbr title="Obrigatório">*</abbr></span>
      <UInput v-model="address.quarter" />
      <small v-if="fieldError('quarter')" class="text-[11px] text-via-red">{{ fieldError('quarter') }}</small>
    </label>

    <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
      <span>Cidade <abbr title="Obrigatório">*</abbr></span>
      <UInput v-model="address.city" />
      <small v-if="fieldError('city')" class="text-[11px] text-via-red">{{ fieldError('city') }}</small>
    </label>

    <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
      <span>UF <abbr title="Obrigatório">*</abbr></span>
      <USelectMenu
        v-model="address.stateCode"
        value-key="value"
        :items="stateItems"
        placeholder="UF"
      />
      <small v-if="fieldError('stateCode')" class="text-[11px] text-via-red">{{ fieldError('stateCode') }}</small>
    </label>

    <template v-if="showExtraFields">
      <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
        <span>Referência</span>
        <UInput v-model="address.reference" />
      </label>
      <label class="grid gap-1.5 [&>span]:text-[11px] [&>span]:font-[650] [&>span]:text-via-muted [&_abbr]:ml-0.5 [&_abbr]:text-via-red [&_abbr]:no-underline">
        <span>Informação adicional</span>
        <UInput v-model="address.additional" />
      </label>
    </template>
  </div>
</template>
