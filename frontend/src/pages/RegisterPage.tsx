import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import { UserPlus, Loader2 } from 'lucide-react'

export default function RegisterPage() {
    const navigate = useNavigate()
    const setAuth = useAuthStore((s) => s.setAuth)
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await authApi.register({ email, password, full_name: fullName })
            const { data } = await authApi.login({ email, password })
            const { data: user } = await authApi.me()
            setAuth(data.access_token, user)
            navigate('/')
        } catch {
            setError('Cet email est déjà utilisé')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="glass rounded-2xl w-full max-w-sm p-8 animate-fade-in">
                <h1 className="text-3xl font-extrabold text-center bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent mb-1">
                    FluxStock
                </h1>
                <p className="text-center text-gray-500 text-sm mb-8">Créer votre compte</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Nom complet</label>
                        <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                            placeholder="Jean Dupont"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                            placeholder="vous@exemple.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Mot de passe</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                            placeholder="Min. 6 caractères"
                        />
                    </div>

                    {error && <p className="text-red-400 text-xs text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
                        Créer mon compte
                    </button>
                </form>

                <p className="text-center text-xs text-gray-600 mt-6">
                    Déjà inscrit ?{' '}
                    <Link to="/login" className="text-brand-400 hover:underline">Se connecter</Link>
                </p>
            </div>
        </div>
    )
}
