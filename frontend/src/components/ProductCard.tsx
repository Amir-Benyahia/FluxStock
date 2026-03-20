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
            className="card p-4 text-left w-full hover:bg-surface-light transition-colors group"
        >
            <div className="flex items-start gap-3">
                {/* Thumbnail */}
                <div className="w-10 h-10 rounded-lg bg-surface-light flex items-center justify-center flex-shrink-0">
                    {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full rounded-lg object-cover" />
                    ) : (
                        <Package size={18} className="text-[#55555a]" />
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-[#e4e4e7] truncate group-hover:text-white transition-colors">
                        {product.name}
                    </h3>
                    <p className="text-xs text-[#55555a] mt-0.5 font-mono">{product.sku}</p>
                </div>

                {/* Stock badge */}
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${isLowStock
                    ? 'bg-red-500/10 text-red-400'
                    : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                    {isLowStock && <AlertTriangle size={11} />}
                    {product.current_stock}
                </div>
            </div>

            {/* Price row */}
            <div className="flex items-center justify-between mt-3 text-xs text-[#55555a]">
                <span>Achat: {product.purchase_price} €</span>
                <span>Vente: {product.selling_price} €</span>
            </div>
        </button>
    )
}
