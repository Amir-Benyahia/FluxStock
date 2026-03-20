import type { Product } from '../lib/api'
import { Package, AlertTriangle } from 'lucide-react'

interface Props {
    product: Product
    onClick?: () => void
}

export default function ProductCard({ product, onClick }: Props) {
    const isLowStock = product.current_stock <= product.safety_stock

    return (
        <button
            onClick={onClick}
            className="glass rounded-xl p-4 text-left w-full hover:bg-white/[0.06] transition-all group animate-fade-in"
        >
            <div className="flex items-start gap-3">
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-lg bg-brand-600/10 flex items-center justify-center flex-shrink-0">
                    {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full rounded-lg object-cover" />
                    ) : (
                        <Package size={20} className="text-brand-400" />
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate group-hover:text-brand-300 transition-colors">
                        {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5 font-mono">{product.sku}</p>
                </div>

                {/* Stock badge */}
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${isLowStock
                        ? 'bg-red-500/15 text-red-400'
                        : 'bg-emerald-500/15 text-emerald-400'
                    }`}>
                    {isLowStock && <AlertTriangle size={12} />}
                    {product.current_stock}
                </div>
            </div>

            {/* Price row */}
            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                <span>Achat: {product.purchase_price} €</span>
                <span>Vente: {product.selling_price} €</span>
            </div>
        </button>
    )
}
