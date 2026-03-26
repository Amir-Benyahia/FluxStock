import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { authApi } from '../lib/api'
import { UserPlus, Loader2, MailCheck } from 'lucide-react'

export default function RegisterPage() {
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [isRegistered, setIsRegistered] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            await authApi.register({ email, password, full_name: fullName })
            setIsRegistered(true)
            toast.success("Compte créé ! Vérifiez vos emails.")
        } catch (err: any) {
            const message =
                err?.response?.data?.detail || "Une erreur est survenue lors de l'inscription"
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    if (isRegistered) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 text-center">
                <div className="card w-full max-w-sm p-8 animate-fade-in">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                        <MailCheck size={32} className="text-emerald-400" />
                    </div>
                    <h1 className="text-xl font-semibold text-white mb-2">Vérifiez vos emails</h1>
                    <p className="text-[#8b8b8e] text-sm mb-8">
                        Un lien de confirmation a été envoyé à <span className="text-white font-medium">{email}</span>.
                    </p>
                    <Link
                        to="/login"
                        className="w-full inline-flex py-2.5 rounded-lg bg-accent text-[#0c0c0f] font-medium text-sm items-center justify-center hover:bg-accent-hover transition-colors"
                    >
                        Retour à la connexion
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="card w-full max-w-sm p-8 animate-fade-in">
                <h1 className="text-xl font-semibold text-center text-white mb-1">
                    FluxStock
                </h1>
                <p className="text-center text-[#8b8b8e] text-sm mb-8">Créer votre compte</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-[#8b8b8e] mb-1.5">Nom complet</label>
                        <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg bg-surface-light border border-surface-border text-sm focus:outline-none focus:border-accent transition-colors"
                            placeholder="Jean Dupont"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-[#8b8b8e] mb-1.5">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg bg-surface-light border border-surface-border text-sm focus:outline-none focus:border-accent transition-colors"
                            placeholder="vous@exemple.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-[#8b8b8e] mb-1.5">Mot de passe</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg bg-surface-light border border-surface-border text-sm focus:outline-none focus:border-accent transition-colors"
                            placeholder="Min. 6 caractères"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 rounded-lg bg-accent text-[#0c0c0f] font-medium text-sm flex items-center justify-center gap-2 hover:bg-accent-hover transition-colors disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                        Créer mon compte
                    </button>
                </form>

                <p className="text-center text-xs text-[#55555a] mt-6">
                    Déjà inscrit ?{' '}
                    <Link to="/login" className="text-accent hover:underline">Se connecter</Link>
                </p>
            </div>
        </div>
    )
}
