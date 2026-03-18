import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  userId: string | null
  email: string | null
  isAuthenticated: boolean
}

const token = localStorage.getItem('access_token')

const initialState: AuthState = {
  userId: null,
  email: null,
  isAuthenticated: !!token,
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
      localStorage.removeItem('access_token')
    },
  },
})

export const { setAuth, clearAuth } = authSlice.actions
export default authSlice.reducer
