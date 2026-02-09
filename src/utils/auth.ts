export type UserRole = 'admin' | 'operator' | 'finance'

const TOKEN_KEY = 'merchant_admin_token'
const ROLE_KEY = 'merchant_admin_role'
const NAME_KEY = 'merchant_admin_name'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

export const getRole = () => (localStorage.getItem(ROLE_KEY) as UserRole | null) ?? null
export const setRole = (role: UserRole) => localStorage.setItem(ROLE_KEY, role)
export const clearRole = () => localStorage.removeItem(ROLE_KEY)

export const getName = () => localStorage.getItem(NAME_KEY) ?? '星辰数码旗舰店'
export const setName = (name: string) => localStorage.setItem(NAME_KEY, name)
export const clearName = () => localStorage.removeItem(NAME_KEY)

export const clearAuth = () => {
  clearToken()
  clearRole()
  clearName()
}
