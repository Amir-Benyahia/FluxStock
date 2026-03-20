import { useQuery } from '@tanstack/react-query'
import { productsApi } from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import { Package, AlertTriangle, TrendingUp, BarChart3 } from 'lucide-react'

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

    const stats = [
        { label: 'Produits', value: totalProducts, icon: Package, color: 'from-brand-500 to-brand-700' },
        { label: 'Alerte stock', value: lowStockCount, icon: AlertTriangle, color: 'from-red-500 to-orange-500' },
        { label: 'Valeur stock', value: `${totalValue.toFixed(0)} €`, icon: TrendingUp, color: 'from-emerald-500 to-teal-500' },
        { label: 'Marge moy.', value: `${avgMargin.toFixed(2)} €`, icon: BarChart3, color: 'from-violet-500 to-purple-500' },
    ]

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-1">
                Bonjour, <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">{user?.full_name}</span> 👋
            </h1>
            <p className="text-gray-500 text-sm mb-8">Voici un aperçu de votre inventaire</p>

            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="glass rounded-xl p-4 animate-fade-in">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
                            <Icon size={20} className="text-white" />
                        </div>
                        <p className="text-2xl font-bold">{value}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                    </div>
                ))}
            </div>

            {/* Low stock alerts */}
            {lowStockCount > 0 && (
                <section className="glass rounded-xl p-5 mb-6">
                    <h2 className="text-sm font-semibold text-red-400 flex items-center gap-2 mb-4">
                        <AlertTriangle size={16} />
                        Produits en stock faible
                    </h2>
                    <div className="space-y-2">
                        {products
                            .filter((p) => p.current_stock <= p.safety_stock)
                            .map((p) => (
                                <div key={p.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                    <div>
                                        <p className="text-sm font-medium">{p.name}</p>
                                        <p className="text-xs text-gray-500 font-mono">{p.sku}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-gray-500">Seuil : {p.safety_stock}</span>
                                        <span className="px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 text-xs font-medium">
                                            {p.current_stock}
                                        </span>
                                    </div>
                                </div>
                            ))}
                    </div>
                </section>
            )}

            {/* Recent activity placeholder */}
            <section className="glass rounded-xl p-5">
                <h2 className="text-sm font-semibold text-gray-300 mb-3">Activité récente</h2>
                <p className="text-xs text-gray-600">
                    Les derniers mouvements de stock apparaîtront ici une fois que vous commencerez à enregistrer des entrées et sorties.
                </p>
            </section>
        </div>
    )
}
