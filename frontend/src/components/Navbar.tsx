import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { LayoutDashboard, Package, ScanBarcode, Crown, LogOut } from 'lucide-react'

const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/products', label: 'Produits', icon: Package },
    { to: '/scan', label: 'Scanner', icon: ScanBarcode },
    { to: '/premium', label: 'Pro', icon: Crown },
]

export default function Navbar() {
    const location = useLocation()
    const logout = useAuthStore((s) => s.logout)

    return (
        <>
            {/* ── Top bar (desktop) ──────────────────────── */}
            <header className="hidden md:flex items-center justify-between px-6 py-3 glass border-b border-white/5 sticky top-0 z-50">
                <Link to="/" className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
                    FluxStock
                </Link>
                <nav className="flex gap-1">
                    {navItems.map(({ to, label, icon: Icon }) => (
                        <Link
                            key={to}
                            to={to}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${location.pathname === to
                                    ? 'bg-brand-600/20 text-brand-400'
                                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                                }`}
                        >
                            <Icon size={18} />
                            {label}
                        </Link>
                    ))}
                </nav>
                <button onClick={logout} className="text-gray-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-white/5">
                    <LogOut size={18} />
                </button>
            </header>

            {/* ── Bottom bar (mobile) ────────────────────── */}
            <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 glass border-t border-white/5 flex justify-around py-2 px-1">
                {navItems.map(({ to, label, icon: Icon }) => (
                    <Link
                        key={to}
                        to={to}
                        className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all ${location.pathname === to
                                ? 'text-brand-400 bg-brand-600/15'
                                : 'text-gray-500'
                            }`}
                    >
                        <Icon size={20} />
                        {label}
                    </Link>
                ))}
                <button onClick={logout} className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-[11px] font-medium text-gray-500">
                    <LogOut size={20} />
                    Sortir
                </button>
            </nav>
        </>
    )
}
