import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsApi, type Product } from '../lib/api'
import ProductCard from '../components/ProductCard'
import { Plus, Search, X, Loader2 } from 'lucide-react'

export default function ProductsPage() {
    const queryClient = useQueryClient()
    const [search, setSearch] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ name: '', sku: '', description: '', purchase_price: 0, selling_price: 0, current_stock: 0 })

    const { data: products = [], isLoading } = useQuery({
        queryKey: ['products'],
        queryFn: () => productsApi.list().then((r) => r.data),
    })

    const createMutation = useMutation({
        mutationFn: (data: Partial<Product>) => productsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            setShowForm(false)
            setForm({ name: '', sku: '', description: '', purchase_price: 0, selling_price: 0, current_stock: 0 })
        },
    })

    const filtered = products.filter(
        (p) =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.sku.toLowerCase().includes(search.toLowerCase()),
    )

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Produits</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                    <Plus size={18} />
                    Ajouter
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                    type="text"
                    placeholder="Rechercher par nom ou code-barres..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                />
            </div>

            {/* Product list */}
            {isLoading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="animate-spin text-brand-400" size={32} />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-600 text-sm">
                    {products.length === 0 ? 'Aucun produit pour le moment. Ajoutez-en un !' : 'Aucun résultat.'}
                </div>
            ) : (
                <div className="grid gap-3">
                    {filtered.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}

            {/* ── Create Product Modal ───────────────────── */}
            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="glass rounded-2xl w-full max-w-md p-6 animate-fade-in">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold">Nouveau produit</h2>
                            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-300">
                                <X size={20} />
                            </button>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                createMutation.mutate(form)
                            }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Nom</label>
                                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-brand-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">SKU / Code-barres</label>
                                <input required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-brand-500 font-mono" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
                                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-brand-500 resize-none" />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Achat (€)</label>
                                    <input type="number" step="0.01" min="0" value={form.purchase_price} onChange={(e) => setForm({ ...form, purchase_price: +e.target.value })} className="w-full px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-brand-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Vente (€)</label>
                                    <input type="number" step="0.01" min="0" value={form.selling_price} onChange={(e) => setForm({ ...form, selling_price: +e.target.value })} className="w-full px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-brand-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Stock</label>
                                    <input type="number" min="0" value={form.current_stock} onChange={(e) => setForm({ ...form, current_stock: +e.target.value })} className="w-full px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-brand-500" />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={createMutation.isPending}
                                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {createMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                                Créer le produit
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
