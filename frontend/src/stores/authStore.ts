/**
 * Auth store — manages JWT token and user state via Zustand.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../lib/api'

interface AuthState {
    token: string | null
    user: User | null
    setToken: (token: string) => void
    setAuth: (token: string, user: User) => void
    setUser: (user: User) => void
    logout: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            setToken: (token) => set({ token }),
            setAuth: (token, user) => set({ token, user }),
            setUser: (user) => set({ user }),
            logout: () => set({ token: null, user: null }),
        }),
        { name: 'fluxstock-auth' },
    ),
)
