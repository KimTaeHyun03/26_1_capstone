import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface Pet {
  id: string
  user_id: string
  name: string
  species: 'dog' | 'cat'
  breed: string | null
  birth_date: string | null
  weight: number | null
  neutered: boolean
}

interface PetState {
  pets: Pet[]
  selectedPet: Pet | null
}

const initialState: PetState = {
  pets: [],
  selectedPet: null,
}

const petSlice = createSlice({
  name: 'pet',
  initialState,
  reducers: {
    setPets(state, action: PayloadAction<Pet[]>) {
      state.pets = action.payload
    },
    setSelectedPet(state, action: PayloadAction<Pet | null>) {
      state.selectedPet = action.payload
    },
    addPet(state, action: PayloadAction<Pet>) {
      state.pets.push(action.payload)
    },
    updatePet(state, action: PayloadAction<Pet>) {
      const idx = state.pets.findIndex((p) => p.id === action.payload.id)
      if (idx !== -1) state.pets[idx] = action.payload
    },
    removePet(state, action: PayloadAction<string>) {
      state.pets = state.pets.filter((p) => p.id !== action.payload)
    },
  },
})

export const { setPets, setSelectedPet, addPet, updatePet, removePet } = petSlice.actions
export default petSlice.reducer
