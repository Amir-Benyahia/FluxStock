import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { productsApi, forecastApi, type ReorderResult } from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import PaywallModal from '../components/PaywallModal'
import { Crown, TrendingDown, ShieldCheck, AlertTriangle, Loader2, BarChart3 } from 'lucide-react'

export default function PremiumDashboard() {
    const user = useAuthStore((s) => s.user)
    const [showPaywall, setShowPaywall] = useState(!user?.is_premium)
    const [selectedProduct, setSelectedProduct] = useState<number | null>(null)

    const { data: products = [] } = useQuery({
        queryKey: ['products'],
        queryFn: () => productsApi.list().then((r) => r.data),
    })

    const { data: reorder, isLoading: reorderLoading } = useQuery<ReorderResult>({
        queryKey: ['reorder', selectedProduct],
        queryFn: () => forecastApi.getReorder(selectedProduct!, 7).then((r) => r.data),
        enabled: !!selectedProduct && user?.is_premium,
    })

    if (showPaywall && !user?.is_premium) {
        return <PaywallModal onClose={() => setShowPaywall(false)} />
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-xl font-semibold text-white mb-0.5 flex items-center gap-2">
                <Crown size={20} className="text-amber-400" />
                Dashboard Pro
            </h1>
            <p className="text-[#8b8b8e] text-sm mb-8">Prédictions et optimisation des stocks</p>

            {/* Product selector */}
            <div className="card p-5 mb-5">
                <label className="block text-xs font-medium text-[#8b8b8e] mb-2">Sélectionnez un produit pour l'analyse</label>
                <select
                    value={selectedProduct ?? ''}
                    onChange={(e) => setSelectedProduct(Number(e.target.value) || null)}
                    className="w-full px-4 py-2.5 rounded-lg bg-surface-light border border-surface-border text-sm focus:outline-none focus:border-accent transition-colors"
                >
                    <option value="">— Choisir un produit —</option>
                    {products.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.name} ({p.sku})
                        </option>
                    ))}
                </select>
            </div>

            {/* Reorder analysis */}
            {selectedProduct && (
                <div className="animate-fade-in">
                    {reorderLoading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="animate-spin text-accent" size={28} />
                        </div>
                    ) : reorder ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Demand card */}
                            <div className="card p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <BarChart3 size={16} className="text-accent" />
                                    <h3 className="font-medium text-sm text-[#e4e4e7]">Analyse de la demande</h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-[#8b8b8e]">Demande quotidienne moy.</span>
                                        <span className="font-mono text-sm text-[#e4e4e7]">{reorder.avg_daily_demand} unités/j</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-[#8b8b8e]">Demande quotidienne max</span>
                                        <span className="font-mono text-sm text-[#e4e4e7]">{reorder.max_daily_demand} unités/j</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-[#8b8b8e]">Délai fournisseur</span>
                                        <span className="font-mono text-sm text-[#e4e4e7]">{reorder.lead_time_days} jours</span>
                                    </div>
                                </div>
                            </div>

                            {/* Reorder point card */}
                            <div className="card p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <ShieldCheck size={16} className="text-emerald-400" />
                                    <h3 className="font-medium text-sm text-[#e4e4e7]">Point de commande</h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-[#8b8b8e]">Stock de sécurité (SS)</span>
                                        <span className="font-mono text-sm text-[#e4e4e7]">{reorder.safety_stock}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-[#8b8b8e]">Point de commande (RP)</span>
                                        <span className="font-mono text-sm font-semibold text-accent">{reorder.reorder_point}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-[#8b8b8e]">Stock actuel</span>
                                        <span className="font-mono text-sm text-[#e4e4e7]">{reorder.current_stock}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Alert banner */}
                            <div className={`md:col-span-2 card p-5 flex items-center gap-4 ${reorder.reorder_needed
                                ? '!border-red-500/20'
                                : '!border-emerald-500/20'
                                }`}>
                                {reorder.reorder_needed ? (
                                    <>
                                        <AlertTriangle size={22} className="text-red-400 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-sm text-red-400">Réapprovisionnement nécessaire</p>
                                            <p className="text-xs text-[#8b8b8e] mt-0.5">
                                                Le stock actuel ({reorder.current_stock}) est en dessous du point de commande ({reorder.reorder_point}).
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck size={22} className="text-emerald-400 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-sm text-emerald-400">Stock suffisant</p>
                                            <p className="text-xs text-[#8b8b8e] mt-0.5">
                                                Le stock actuel ({reorder.current_stock}) est au-dessus du point de commande ({reorder.reorder_point}).
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Formula explanation */}
                            <div className="md:col-span-2 card p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <TrendingDown size={16} className="text-violet-400" />
                                    <h3 className="font-medium text-sm text-[#e4e4e7]">Formules utilisées</h3>
                                </div>
                                <div className="space-y-1.5 text-xs text-[#55555a] font-mono">
                                    <p>SS = (d_max × L_max) − (d_avg × L)</p>
                                    <p>RP = (d_avg × L) + SS</p>
                                    <p>Réappro nécessaire si : stock_actuel &lt; RP</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-16 text-[#55555a] text-sm">
                            Aucune donnée de mouvement disponible pour ce produit.
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
