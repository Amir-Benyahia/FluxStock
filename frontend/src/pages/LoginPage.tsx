import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import { LogIn, Loader2 } from 'lucide-react'

export default function LoginPage() {
    const navigate = useNavigate()
    const setAuth = useAuthStore((s) => s.setAuth)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const { data } = await authApi.login({ email, password })
            const { data: user } = await authApi.me()
            setAuth(data.access_token, user)
            navigate('/')
        } catch {
            setError('Email ou mot de passe incorrect')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="glass rounded-2xl w-full max-w-sm p-8 animate-fade-in">
                {/* Logo */}
                <h1 className="text-3xl font-extrabold text-center bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent mb-1">
                    FluxStock
                </h1>
                <p className="text-center text-gray-500 text-sm mb-8">Connexion à votre espace</p>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && <p className="text-red-400 text-xs text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
                        Se connecter
                    </button>
                </form>

                <p className="text-center text-xs text-gray-600 mt-6">
                    Pas encore de compte ?{' '}
                    <Link to="/register" className="text-brand-400 hover:underline">Créer un compte</Link>
                </p>
            </div>
        </div>
    )
}
