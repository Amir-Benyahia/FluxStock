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
            <header className="hidden md:flex items-center justify-between px-6 h-14 bg-[#111113] border-b border-surface-border sticky top-0 z-50">
                <Link to="/" className="text-base font-semibold text-white tracking-tight">
                    FluxStock
                </Link>
                <nav className="flex gap-1">
                    {navItems.map(({ to, label, icon: Icon }) => (
                        <Link
                            key={to}
                            to={to}
                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${location.pathname === to
                                ? 'bg-accent-muted text-accent'
                                : 'text-[#8b8b8e] hover:text-[#e4e4e7] hover:bg-surface'
                                }`}
                        >
                            <Icon size={16} />
                            {label}
                        </Link>
                    ))}
                </nav>
                <button onClick={logout} className="text-[#55555a] hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-surface">
                    <LogOut size={16} />
                </button>
            </header>

            {/* ── Bottom bar (mobile) ────────────────────── */}
            <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#111113] border-t border-surface-border flex justify-around py-2 px-1">
                {navItems.map(({ to, label, icon: Icon }) => (
                    <Link
                        key={to}
                        to={to}
                        className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-colors ${location.pathname === to
                            ? 'text-accent'
                            : 'text-[#55555a]'
                            }`}
                    >
                        <Icon size={18} />
                        {label}
                    </Link>
                ))}
                <button onClick={logout} className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-[11px] font-medium text-[#55555a]">
                    <LogOut size={18} />
                    Sortir
                </button>
            </nav>
        </>
    )
}
