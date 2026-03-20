import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ProductsPage from './pages/ProductsPage'
import ScannerPage from './pages/ScannerPage'
import PremiumDashboard from './pages/PremiumDashboard'

export default function App() {
    const token = useAuthStore((s) => s.token)

    return (
        <BrowserRouter>
            {token && <Navbar />}
            <main className="min-h-screen">
                <Routes>
                    {/* Public */}
                    <Route path="/login" element={token ? <Navigate to="/" /> : <LoginPage />} />
                    <Route path="/register" element={token ? <Navigate to="/" /> : <RegisterPage />} />

                    {/* Protected */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/products" element={<ProductsPage />} />
                        <Route path="/scan" element={<ScannerPage />} />
                        <Route path="/premium" element={<PremiumDashboard />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </main>
        </BrowserRouter>
    )
}
