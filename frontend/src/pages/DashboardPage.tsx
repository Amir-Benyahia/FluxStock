import { useQuery } from '@tanstack/react-query'
import { productsApi } from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import { Package, AlertTriangle, TrendingUp, BarChart3, Zap } from 'lucide-react'

export default function DashboardPage() {
    const user = useAuthStore((s) => s.user)
    const { data: products = [] } = useQuery({
        queryKey: ['products'],
        queryFn: () => productsApi.list().then((r) => r.data),
    })

    const totalProducts = products.length
    const lowStockCount = products.filter((p) => p.current_stock <= p.safety_stock).length
    const totalValue = products.reduce((sum, p) => sum + p.current_stock * p.selling_price, 0)
    const avgMargin = products.length
        ? products.reduce((sum, p) => sum + (p.selling_price - p.purchase_price), 0) / products.length
        : 0

    const criticalProducts = [...products]
        .filter((p) => p.safety_stock > 0)
        .sort((a, b) => (a.current_stock - a.safety_stock) - (b.current_stock - b.safety_stock))
        .slice(0, 3)

    const stats = [
        { label: 'Produits', value: totalProducts, icon: Package, accent: 'text-accent bg-accent-muted' },
        { label: 'Alertes stock', value: lowStockCount, icon: AlertTriangle, accent: 'text-red-400 bg-red-500/10' },
        { label: 'Valeur stock', value: `${totalValue.toLocaleString('fr-FR')} €`, icon: TrendingUp, accent: 'text-emerald-400 bg-emerald-500/10' },
        { label: 'Marge moy.', value: `${avgMargin.toFixed(2)} €`, icon: BarChart3, accent: 'text-violet-400 bg-violet-500/10' },
    ]

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-xl font-semibold text-white mb-0.5">
                Bonjour, {user?.full_name}
            </h1>
            <p className="text-[#8b8b8e] text-sm mb-8">Voici un aperçu de votre inventaire</p>

            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                {stats.map(({ label, value, icon: Icon, accent }) => (
                    <div key={label} className="card p-4">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${accent}`}>
                            <Icon size={18} />
                        </div>
                        <p className="text-xl font-semibold text-white">{value}</p>
                        <p className="text-xs text-[#8b8b8e] mt-0.5">{label}</p>
                    </div>
                ))}
            </div>

            {/* Action immédiate — Top 3 critical products */}
            {criticalProducts.length > 0 && (
                <section className="card p-5 mb-5">
                    <h2 className="text-sm font-medium text-[#e4e4e7] flex items-center gap-2 mb-4">
                        <Zap size={15} className="text-amber-400" />
                        Action immédiate
                    </h2>
                    <div className="space-y-3">
                        {criticalProducts.map((p, i) => {
                            const deficit = p.current_stock - p.safety_stock
                            const ratio = p.safety_stock > 0 ? Math.min(p.current_stock / p.safety_stock, 1) : 1
                            const barColor = deficit <= 0 ? 'bg-red-400' : ratio < 0.6 ? 'bg-amber-400' : 'bg-emerald-400'

                            return (
                                <div key={p.id} className="flex items-center gap-3 py-2 border-b border-surface-border last:border-0">
                                    <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-semibold ${i === 0 ? 'bg-red-500/10 text-red-400' :
                                        i === 1 ? 'bg-amber-500/10 text-amber-400' :
                                            'bg-yellow-500/10 text-yellow-400'
                                        }`}>
                                        {i + 1}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-[#e4e4e7] truncate">{p.name}</p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <div className="flex-1 h-1 rounded-full bg-surface-light overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${barColor}`}
                                                    style={{ width: `${Math.max(ratio * 100, 4)}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] text-[#55555a] w-12 text-right font-mono">
                                                {p.current_stock}/{p.safety_stock}
                                            </span>
                                        </div>
                                    </div>

                                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${deficit <= 0
                                        ? 'bg-red-500/10 text-red-400'
                                        : 'bg-amber-500/10 text-amber-400'
                                        }`}>
                                        {deficit <= 0 ? 'Rupture' : `+${deficit}`}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </section>
            )}

            {/* Low stock alerts */}
            {lowStockCount > 0 && (
                <section className="card p-5 mb-5">
                    <h2 className="text-sm font-medium text-[#e4e4e7] flex items-center gap-2 mb-4">
                        <AlertTriangle size={15} className="text-red-400" />
                        Produits en stock faible
                    </h2>
                    <div className="space-y-2">
                        {products
                            .filter((p) => p.current_stock <= p.safety_stock)
                            .map((p) => (
                                <div key={p.id} className="flex items-center justify-between py-2 border-b border-surface-border last:border-0">
                                    <div>
                                        <p className="text-sm text-[#e4e4e7]">{p.name}</p>
                                        <p className="text-xs text-[#55555a] font-mono">{p.sku}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-[#55555a]">Seuil : {p.safety_stock}</span>
                                        <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 text-xs font-medium">
                                            {p.current_stock}
                                        </span>
                                    </div>
                                </div>
                            ))}
                    </div>
                </section>
            )}

            {/* Recent activity placeholder */}
            <section className="card p-5">
                <h2 className="text-sm font-medium text-[#e4e4e7] mb-3">Activité récente</h2>
                <p className="text-xs text-[#55555a]">
                    Les derniers mouvements de stock apparaîtront ici.
                </p>
            </section>
        </div>
    )
}
