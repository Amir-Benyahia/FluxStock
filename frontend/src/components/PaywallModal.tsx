import { Crown, X } from 'lucide-react'

interface Props {
    onClose: () => void
}

export default function PaywallModal({ onClose }: Props) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
            <div className="glass rounded-2xl max-w-md w-full p-8 relative">
                {/* Close */}
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-300">
                    <X size={20} />
                </button>

                {/* Icon */}
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-6 animate-pulse-glow">
                    <Crown size={32} className="text-white" />
                </div>

                <h2 className="text-2xl font-bold text-center mb-2">Passez à FluxStock Pro</h2>
                <p className="text-gray-400 text-center text-sm mb-6">
                    Débloquez les prédictions IA avancées, l'analyse de tendances et les alertes de réapprovisionnement en temps réel.
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                    {[
                        'Prédictions de demande par machine learning',
                        'Calcul automatique du point de commande',
                        'Alertes de stock critique en temps réel',
                        'Export de rapports PDF',
                    ].map((feat) => (
                        <li key={feat} className="flex items-center gap-3 text-sm text-gray-300">
                            <span className="w-5 h-5 rounded-full bg-brand-600/20 flex items-center justify-center text-brand-400 text-xs">✓</span>
                            {feat}
                        </li>
                    ))}
                </ul>

                <button
                    onClick={() => {
                        // TODO: redirect to Stripe Checkout
                        alert('Stripe Checkout integration — à connecter avec votre clé Stripe.')
                    }}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                    Commencer l'essai Pro — 9,99 €/mois
                </button>

                <p className="text-center text-xs text-gray-600 mt-3">Annulation possible à tout moment</p>
            </div>
        </div>
    )
}
