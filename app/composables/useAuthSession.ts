/**
 * Sessão mock compartilhada — substitui JWT/cookie até a API de auth.
 */
export function useAuthSession() {
  const authenticated = useState<boolean>('via-auth-authenticated', () => false)
  const email = useState<string | null>('via-auth-email', () => null)

  const isAuthenticated = computed(() => authenticated.value)

  function login(userEmail: string) {
    authenticated.value = true
    email.value = userEmail.trim().toLowerCase()
  }

  function logout() {
    authenticated.value = false
    email.value = null
  }

  return {
    authenticated,
    email,
    isAuthenticated,
    login,
    logout
  }
}
