import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { authApi } from '../lib/api'
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react'

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const token = searchParams.get('token')
    
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('Vérification de votre compte...')

    useEffect(() => {
        if (!token) {
            setStatus('error')
            setMessage('Jeton de vérification manquant.')
            return
        }

        const verify = async () => {
            try {
                await authApi.verifyEmail(token)
                setStatus('success')
                setMessage('Votre compte a été vérifié avec succès !')
            } catch (err: any) {
                setStatus('error')
                setMessage(err.response?.data?.detail || 'Erreur lors de la vérification.')
            }
        }

        verify()
    }, [token])

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="card max-w-md w-full p-8 text-center animate-fade-in">
                {status === 'loading' && (
                    <>
                        <Loader2 className="animate-spin text-accent mx-auto mb-4" size={40} />
                        <h1 className="text-xl font-semibold text-white mb-2">Vérification en cours</h1>
                        <p className="text-[#8b8b8e] text-sm">{message}</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={32} className="text-emerald-400" />
                        </div>
                        <h1 className="text-xl font-semibold text-white mb-2">Félicitations !</h1>
                        <p className="text-[#8b8b8e] text-sm mb-8">{message}</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full py-2.5 rounded-lg bg-accent text-[#0c0c0f] font-medium text-sm hover:bg-accent-hover transition-colors flex items-center justify-center gap-2"
                        >
                            Se connecter
                            <ArrowRight size={16} />
                        </button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                            <XCircle size={32} className="text-red-400" />
                        </div>
                        <h1 className="text-xl font-semibold text-white mb-2">Oups !</h1>
                        <p className="text-[#8b8b8e] text-sm mb-8">{message}</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full py-2.5 rounded-lg bg-surface border border-surface-border text-[#8b8b8e] font-medium text-sm hover:bg-surface-light transition-colors"
                        >
                            Retour à la connexion
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}
