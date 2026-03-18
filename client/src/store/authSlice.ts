import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  userId: string | null
  email: string | null
  isAuthenticated: boolean
}

// 토큰은 HttpOnly 쿠키로 관리 — 민감하지 않은 사용자 정보만 localStorage에 저장
const savedUser = (() => {
  try {
    const u = localStorage.getItem('auth_user')
    return u ? JSON.parse(u) : null
  } catch {
    return null
  }
})()

const initialState: AuthState = {
  userId: savedUser?.userId ?? null,
  email: savedUser?.email ?? null,
  isAuthenticated: !!savedUser,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<{ userId: string; email: string }>) {
      state.userId = action.payload.userId
      state.email = action.payload.email
      state.isAuthenticated = true
    },
    clearAuth(state) {
      state.userId = null
      state.email = null
      state.isAuthenticated = false
      localStorage.removeItem('auth_user')
    },
  },
})

export const { setAuth, clearAuth } = authSlice.actions
export default authSlice.reducer
