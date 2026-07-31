import { apiRequest } from '../lib/api'
import type { ForgotPasswordResponse } from '../types/auth'

export const authApi = {
  forgotPassword: (email: string) =>
    apiRequest<ForgotPasswordResponse>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, newPassword: string) =>
    apiRequest<void>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    }),
}
