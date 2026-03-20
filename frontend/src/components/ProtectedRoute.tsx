import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export default function ProtectedRoute() {
    const token = useAuthStore((s) => s.token)

    if (!token) {
        return <Navigate to="/login" replace />
    }

    return (
        <div className="pb-20 md:pb-0">
            <Outlet />
        </div>
    )
}
