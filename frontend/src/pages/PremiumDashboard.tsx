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
            <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
                <Crown size={24} className="text-amber-400" />
                Dashboard Pro
            </h1>
            <p className="text-gray-500 text-sm mb-8">Prédictions IA et optimisation des stocks</p>

            {/* Product selector */}
            <div className="glass rounded-xl p-5 mb-6">
                <label className="block text-xs font-medium text-gray-400 mb-2">Sélectionnez un produit pour l'analyse</label>
                <select
                    value={selectedProduct ?? ''}
                    onChange={(e) => setSelectedProduct(Number(e.target.value) || null)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-brand-500 transition-colors"
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
                            <Loader2 className="animate-spin text-brand-400" size={32} />
                        </div>
                    ) : reorder ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Demand card */}
                            <div className="glass rounded-xl p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <BarChart3 size={18} className="text-brand-400" />
                                    <h3 className="font-semibold text-sm">Analyse de la demande</h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500">Demande quotidienne moy.</span>
                                        <span className="font-mono text-sm">{reorder.avg_daily_demand} unités/j</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500">Demande quotidienne max</span>
                                        <span className="font-mono text-sm">{reorder.max_daily_demand} unités/j</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500">Délai fournisseur</span>
                                        <span className="font-mono text-sm">{reorder.lead_time_days} jours</span>
                                    </div>
                                </div>
                            </div>

                            {/* Reorder point card */}
                            <div className="glass rounded-xl p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <ShieldCheck size={18} className="text-emerald-400" />
                                    <h3 className="font-semibold text-sm">Point de commande</h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500">Stock de sécurité (SS)</span>
                                        <span className="font-mono text-sm">{reorder.safety_stock}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500">Point de commande (RP)</span>
                                        <span className="font-mono text-sm font-bold text-brand-400">{reorder.reorder_point}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500">Stock actuel</span>
                                        <span className="font-mono text-sm">{reorder.current_stock}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Alert banner */}
                            <div className={`md:col-span-2 rounded-xl p-5 flex items-center gap-4 ${reorder.reorder_needed
                                    ? 'bg-red-500/10 border border-red-500/20'
                                    : 'bg-emerald-500/10 border border-emerald-500/20'
                                }`}>
                                {reorder.reorder_needed ? (
                                    <>
                                        <AlertTriangle size={24} className="text-red-400 flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold text-sm text-red-300">Réapprovisionnement nécessaire</p>
                                            <p className="text-xs text-red-400/70 mt-0.5">
                                                Le stock actuel ({reorder.current_stock}) est en dessous du point de commande ({reorder.reorder_point}).
                                                Commandez immédiatement pour éviter une rupture.
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck size={24} className="text-emerald-400 flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold text-sm text-emerald-300">Stock suffisant</p>
                                            <p className="text-xs text-emerald-400/70 mt-0.5">
                                                Le stock actuel ({reorder.current_stock}) est au-dessus du point de commande ({reorder.reorder_point}).
                                                Aucune action requise.
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Formula explanation */}
                            <div className="md:col-span-2 glass rounded-xl p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <TrendingDown size={18} className="text-violet-400" />
                                    <h3 className="font-semibold text-sm">Formules utilisées</h3>
                                </div>
                                <div className="space-y-2 text-xs text-gray-500 font-mono">
                                    <p>SS = (d_max × L_max) − (d_avg × L)</p>
                                    <p>RP = (d_avg × L) + SS</p>
                                    <p>Réappro nécessaire si : stock_actuel &lt; RP</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-16 text-gray-600 text-sm">
                            Aucune donnée de mouvement disponible pour ce produit.
                            Enregistrez des sorties de stock pour activer les prédictions.
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
