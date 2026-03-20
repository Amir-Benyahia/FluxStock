import { Crown, X } from 'lucide-react'

interface Props {
    onClose: () => void
}

export default function PaywallModal({ onClose }: Props) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 animate-fade-in p-4">
            <div className="card max-w-md w-full p-8 relative">
                {/* Close */}
                <button onClick={onClose} className="absolute top-4 right-4 text-[#55555a] hover:text-[#e4e4e7]">
                    <X size={18} />
                </button>

                {/* Icon */}
                <div className="mx-auto w-14 h-14 rounded-xl bg-amber-500/10 flex items-center justify-center mb-6">
                    <Crown size={28} className="text-amber-400" />
                </div>

                <h2 className="text-lg font-semibold text-white text-center mb-2">Passez à FluxStock Pro</h2>
                <p className="text-[#8b8b8e] text-center text-sm mb-6">
                    Débloquez les prédictions avancées, l'analyse de tendances et les alertes de réapprovisionnement.
                </p>

                {/* Features */}
                <ul className="space-y-2.5 mb-8">
                    {[
                        'Prédictions de demande par machine learning',
                        'Calcul automatique du point de commande',
                        'Alertes de stock critique en temps réel',
                        'Export de rapports PDF',
                    ].map((feat) => (
                        <li key={feat} className="flex items-center gap-3 text-sm text-[#e4e4e7]">
                            <span className="w-5 h-5 rounded-md bg-accent-muted flex items-center justify-center text-accent text-xs">✓</span>
                            {feat}
                        </li>
                    ))}
                </ul>

                <button
                    onClick={() => {
                        alert('Stripe Checkout — à connecter avec votre clé Stripe.')
                    }}
                    className="w-full py-2.5 rounded-lg bg-accent text-[#0c0c0f] font-medium text-sm hover:bg-accent-hover transition-colors"
                >
                    Commencer l'essai Pro — 9,99 €/mois
                </button>

                <p className="text-center text-xs text-[#55555a] mt-3">Annulation possible à tout moment</p>
            </div>
        </div>
    )
}
