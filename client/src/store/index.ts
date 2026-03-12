import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import petReducer from './petSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    pet: petReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
