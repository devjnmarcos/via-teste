/**
 * Fixtures e helpers de autenticação mock (até API real).
 * Credencial de demo: demo@viareversa.com.br / demo123
 */

export const DEMO_AUTH = {
  email: 'demo@viareversa.com.br',
  password: 'demo123',
  /** Token válido para fluxo de nova senha em Story/Vitest. */
  validResetToken: 'reset-demo-ok',
  expiredResetToken: 'expired'
} as const

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function isValidEmailFormat(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email))
}

export function authenticateMock(email: string, password: string): boolean {
  return normalizeEmail(email) === DEMO_AUTH.email && password === DEMO_AUTH.password
}

/** Token ausente, curto ou "expired" → inválido. */
export function isValidResetToken(token: string | null | undefined): boolean {
  if (!token || token.trim().length < 8) return false
  return token.trim() !== DEMO_AUTH.expiredResetToken
}

export interface TransportadorCadastroInput {
  /** Step 1 — dados básicos */
  name: string
  email: string
  cellphone: string
  federalId: string
  /** Step 2 — endereço */
  zipCode: string
  address: string
  number: string
  complement: string
  quarter: string
  city: string
  stateCode: string
  /** Step 3 — documentos (mock: nome do arquivo) */
  documentFileName: string
  facePhotoFileName: string
  /** Step 4 — regiões */
  regionIds: string[]
  /** Step 5 — termos */
  termsAccepted: boolean
}

export const transportadorSteps = [
  { id: 'basics', label: 'Dados básicos', description: 'Nome, contato e CPF' },
  { id: 'address', label: 'Endereço', description: 'CEP e localização' },
  { id: 'documents', label: 'Documentos', description: 'CNH/RG e foto' },
  { id: 'regions', label: 'Regiões', description: 'Áreas de atuação' },
  { id: 'terms', label: 'Termos', description: 'Aceite final' }
] as const

export const transportadorRegionOptions = [
  { id: 'reg-1', label: 'Centro · São Paulo · SP' },
  { id: 'reg-2', label: 'Zona Sul · São Paulo · SP' },
  { id: 'reg-3', label: 'Zona Norte · São Paulo · SP' },
  { id: 'reg-4', label: 'Grande ABC · SP' },
  { id: 'reg-5', label: 'Campinas · SP' },
  { id: 'reg-6', label: 'Niterói · RJ' }
]

export const transportadorStateOptions = [
  { label: 'SP', value: 'SP' },
  { label: 'RJ', value: 'RJ' },
  { label: 'MG', value: 'MG' },
  { label: 'PR', value: 'PR' },
  { label: 'RS', value: 'RS' },
  { label: 'BA', value: 'BA' }
]

export const transportadorTermsText = `TERMOS E CONDIÇÕES DE USO — VIA REVERSA (mock)

1. Ao concluir o cadastro, o transportador declara que as informações fornecidas são verdadeiras.
2. A aprovação do cadastro depende de análise da equipe Via Reversa.
3. Documentos enviados serão usados exclusivamente para validação cadastral.
4. O transportador compromete-se a atuar apenas nas regiões selecionadas.
5. Estes termos são demonstrativos para o front V2 e não substituem o documento jurídico real.`

export function createEmptyTransportadorForm(): TransportadorCadastroInput {
  return {
    name: '',
    email: '',
    cellphone: '',
    federalId: '',
    zipCode: '',
    address: '',
    number: '',
    complement: '',
    quarter: '',
    city: '',
    stateCode: 'SP',
    documentFileName: '',
    facePhotoFileName: '',
    regionIds: [],
    termsAccepted: false
  }
}

export function validateTransportadorStep(
  stepIndex: number,
  form: TransportadorCadastroInput
): string | null {
  if (stepIndex === 0) {
    if (!form.name.trim()) return 'Informe o nome completo.'
    if (!isValidEmailFormat(form.email)) return 'Informe um e-mail válido.'
    if (!form.cellphone.trim()) return 'Informe o celular.'
    if (!form.federalId.trim() || form.federalId.replace(/\D/g, '').length < 11) {
      return 'Informe um CPF válido.'
    }
  }
  if (stepIndex === 1) {
    if (!form.zipCode.trim() || form.zipCode.replace(/\D/g, '').length < 8) return 'Informe o CEP.'
    if (!form.address.trim()) return 'Informe o endereço.'
    if (!form.number.trim()) return 'Informe o número.'
    if (!form.quarter.trim()) return 'Informe o bairro.'
    if (!form.city.trim()) return 'Informe a cidade.'
    if (!form.stateCode.trim()) return 'Informe a UF.'
  }
  if (stepIndex === 2) {
    if (!form.documentFileName.trim()) return 'Envie o documento (CNH ou RG).'
  }
  if (stepIndex === 3) {
    if (!form.regionIds.length) return 'Selecione ao menos uma região de atuação.'
  }
  if (stepIndex === 4) {
    if (!form.termsAccepted) return 'Você deve aceitar os termos para finalizar.'
  }
  return null
}

/** @deprecated use validateTransportadorStep — mantido para compat de testes legados. */
export function validateTransportadorForm(form: TransportadorCadastroInput): string | null {
  for (let i = 0; i < 5; i += 1) {
    const error = validateTransportadorStep(i, form)
    if (error) return error
  }
  return null
}

export interface MotoboyCadastroInput {
  fullName: string
  cpf: string
  email: string
  phone: string
  city: string
}

export function createEmptyMotoboyForm(): MotoboyCadastroInput {
  return {
    fullName: '',
    cpf: '',
    email: '',
    phone: '',
    city: ''
  }
}

export function validateMotoboyForm(form: MotoboyCadastroInput): string | null {
  if (!form.fullName.trim()) return 'Informe o nome completo.'
  if (!form.cpf.trim() || form.cpf.replace(/\D/g, '').length < 11) return 'Informe um CPF válido.'
  if (!isValidEmailFormat(form.email)) return 'Informe um e-mail válido.'
  if (!form.phone.trim()) return 'Informe o telefone.'
  if (!form.city.trim()) return 'Informe a cidade.'
  return null
}

export interface LojaCadastroInput {
  fullName: string
  email: string
  phone: string
  storeName: string
  document: string
}

export function createEmptyLojaForm(): LojaCadastroInput {
  return {
    fullName: '',
    email: '',
    phone: '',
    storeName: '',
    document: ''
  }
}

export function validateLojaForm(form: LojaCadastroInput): string | null {
  if (!form.fullName.trim()) return 'Informe o nome.'
  if (!isValidEmailFormat(form.email)) return 'Informe um e-mail válido.'
  if (!form.phone.trim()) return 'Informe o telefone.'
  if (!form.storeName.trim()) return 'Informe a loja / conta.'
  if (!form.document.trim()) return 'Informe CPF ou CNPJ.'
  return null
}

export interface ExcluirContaInput {
  email: string
  reason: string
  confirmText: string
}

export function createEmptyExcluirContaForm(): ExcluirContaInput {
  return {
    email: '',
    reason: '',
    confirmText: ''
  }
}

export function validateExcluirContaForm(form: ExcluirContaInput): string | null {
  if (!isValidEmailFormat(form.email)) return 'Informe um e-mail válido.'
  if (!form.reason.trim()) return 'Informe o motivo.'
  if (form.confirmText.trim().toUpperCase() !== 'EXCLUIR') {
    return 'Digite EXCLUIR para confirmar.'
  }
  return null
}
