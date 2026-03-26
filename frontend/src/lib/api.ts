/**
 * Axios instance with JWT interceptor.
 * All API calls go through this client.
 */
import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Auto-logout on 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().logout()
            window.location.href = '/login'
        }
        return Promise.reject(error)
    },
)

export default api

// ── API functions ─────────────────────────────────
export interface User {
    id: number
    email: string
    full_name: string
    role: string
    is_premium: boolean
}

export interface Product {
    id: number
    owner_id: number
    name: string
    sku: string
    description: string | null
    image_url: string | null
    current_stock: number
    safety_stock: number
    purchase_price: number
    selling_price: number
}

export interface StockMovement {
    id: number
    product_id: number
    user_id: number | null
    quantity_changed: number
    type: 'IN' | 'OUT' | 'LOSS' | 'RETURN'
    reason: string | null
    timestamp: string
}

export interface ReorderResult {
    product_id: number
    product_name: string
    current_stock: number
    avg_daily_demand: number
    max_daily_demand: number
    safety_stock: number
    reorder_point: number
    reorder_needed: boolean
    lead_time_days: number
}

// Auth
export const authApi = {
    register: (data: { email: string; password: string; full_name: string }) =>
        api.post<User>('/auth/register', data),
    login: (data: { email: string; password: string }) =>
        api.post<{ access_token: string; token_type: string }>('/auth/login', data),
    me: () => api.get<User>('/auth/me'),
    verifyEmail: (token: string) => api.get<{ message: string }>(`/auth/verify-email?token=${token}`),
}

// Products
export const productsApi = {
    list: () => api.get<Product[]>('/products/'),
    get: (id: number) => api.get<Product>(`/products/${id}`),
    getBySku: (sku: string) => api.get<Product>(`/products/sku/${sku}`),
    create: (data: Partial<Product>) => api.post<Product>('/products/', data),
    update: (id: number, data: Partial<Product>) => api.put<Product>(`/products/${id}`, data),
    delete: (id: number) => api.delete(`/products/${id}`),
}

// Stock
export const stockApi = {
    createMovement: (data: { product_id: number; quantity_changed: number; type: string; reason?: string }) =>
        api.post<StockMovement>('/stock/movements', data),
    listMovements: (productId: number) =>
        api.get<StockMovement[]>(`/stock/movements/${productId}`),
}

// Forecasting
export const forecastApi = {
    getReorder: (productId: number, leadTimeDays = 7) =>
        api.get<ReorderResult>(`/products/${productId}/reorder`, { params: { lead_time_days: leadTimeDays } }),
}

// Stripe
export const stripeApi = {
    createCheckoutSession: () => api.post<{ url: string }>('/webhooks/stripe/create-checkout-session'),
}
