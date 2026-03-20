import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { authApi } from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import { LogIn, Loader2 } from 'lucide-react'

export default function LoginPage() {
    const navigate = useNavigate()
    const setToken = useAuthStore((s) => s.setToken)
    const setUser = useAuthStore((s) => s.setUser)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: tokenData } = await authApi.login({ email, password })
            setToken(tokenData.access_token)
            const { data: user } = await authApi.me()
            setUser(user)
            toast.success(`Bienvenue ${user.full_name}`)
            navigate('/')
        } catch (err: any) {
            const message =
                err?.response?.data?.detail || 'Email ou mot de passe incorrect'
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="card w-full max-w-sm p-8 animate-fade-in">
                <h1 className="text-xl font-semibold text-center text-white mb-1">
                    FluxStock
                </h1>
                <p className="text-center text-[#8b8b8e] text-sm mb-8">Connexion à votre espace</p>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg bg-surface-light border border-surface-border text-sm focus:outline-none focus:border-accent transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 rounded-lg bg-accent text-[#0c0c0f] font-medium text-sm flex items-center justify-center gap-2 hover:bg-accent-hover transition-colors disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
                        Se connecter
                    </button>
                </form>

                <p className="text-center text-xs text-[#55555a] mt-6">
                    Pas encore de compte ?{' '}
                    <Link to="/register" className="text-accent hover:underline">Créer un compte</Link>
                </p>
            </div>
        </div>
    )
}
