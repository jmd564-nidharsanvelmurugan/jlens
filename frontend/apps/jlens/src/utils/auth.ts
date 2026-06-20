// Authentication utility - checks if user is logged in
// Token is stored in HTTP-only cookie (not accessible to JavaScript)
// This only checks for email presence as a UI indicator

export const isAuthenticated = (): boolean => {
  return !!sessionStorage.getItem('email')
}

export const getUserEmail = (): string | null => {
  return sessionStorage.getItem('email')
}

export const getUserName = (): string | null => {
  return sessionStorage.getItem('name')
}

export const clearAuthData = (): void => {
  sessionStorage.removeItem('email')
  sessionStorage.removeItem('name')
}
