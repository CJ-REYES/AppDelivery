export type AuthUser = {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string | null
  emailConfirmed: boolean
  roles: string[]
  createdAt: string
  updatedAt: string
}

export type AuthResponse = {
  accessToken: string
  expiresAt: string
  user: AuthUser
}

export type LoginInput = {
  email: string
  password: string
}

export type RegisterInput = LoginInput & {
  firstName: string
  lastName: string
  phoneNumber: string | null
}

export type ForgotPasswordResponse = {
  message: string
  resetToken: string | null
}
