import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import { productsApi } from '../lib/api'
import { ScanBarcode, Camera, XCircle, Plus, Loader2, UploadCloud, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

export default function ScannerPage() {
    const navigate = useNavigate()
    const scannerRef = useRef<Html5Qrcode | null>(null)
    const [scanning, setScanning] = useState(false)
    const [loading, setLoading] = useState(false)
    const [notFoundSku, setNotFoundSku] = useState<string | null>(null)
    const [error, setError] = useState('')

    const startScanner = async () => {
        setNotFoundSku(null)
        setError('')

        try {
            const scanner = new Html5Qrcode('scanner-region')
            scannerRef.current = scanner

            await scanner.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 280, height: 150 } },
                async (decodedText) => {
                    await scanner.stop()
                    setScanning(false)
                    handleSkuScanned(decodedText)
                },
                () => { },
            )
            setScanning(true)
        } catch (err) {
            setError("Impossible d'accéder à la caméra. Vérifiez les permissions.")
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setLoading(true)
        setNotFoundSku(null)
        setError('')

        try {
            const html5QrCode = new Html5Qrcode('scanner-region', false)
            const decodedText = await html5QrCode.scanFile(file, true)
            handleSkuScanned(decodedText)
        } catch (err) {
            toast.error("Aucun code-barres détecté dans cette image.")
        } finally {
            setLoading(false)
        }
    }

    const handleSkuScanned = async (sku: string) => {
        setLoading(true)
        try {
            const { data } = await productsApi.getBySku(sku)
            navigate('/products', { state: { highlightedSku: sku } })
        } catch (err: any) {
            if (err.response?.status === 404) {
                setNotFoundSku(sku)
            } else {
                setError("Une erreur est survenue lors de la recherche du produit.")
            }
        } finally {
            setLoading(false)
        }
    }

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop()
            } catch {
                // already stopped
            }
            setScanning(false)
        }
    }

    useEffect(() => {
        return () => {
            stopScanner()
        }
    }, [])

    return (
        <div className="max-w-md mx-auto px-4 py-8">
            <h1 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <ScanBarcode size={20} className="text-accent" />
                Scanner
            </h1>

            {/* Scanner viewport */}
            <div className="card overflow-hidden mb-6">
                <div id="scanner-region" className="w-full min-h-[250px] bg-black/30 flex items-center justify-center border-b border-surface-border">
                    {!scanning && !loading && !notFoundSku && (
                        <ImageIcon size={48} className="text-[#55555a] opacity-20" />
                    )}
                </div>

                {!scanning && !loading && !notFoundSku && (
                    <div className="p-6 grid grid-cols-1 gap-4">
                        {/* Camera Scan Button */}
                        <button
                            onClick={startScanner}
                            className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-accent text-[#0c0c0f] font-medium text-sm hover:bg-accent-hover transition-colors"
                        >
                            <Camera size={18} />
                            Utiliser la caméra
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-surface-border"></span>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-[#0c0c0f] px-2 text-[#55555a]">Ou</span>
                            </div>
                        </div>

                        {/* Drag & Drop / File Upload */}
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-surface-border rounded-lg cursor-pointer hover:bg-surface-light transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <UploadCloud size={24} className="text-[#8b8b8e] mb-2" />
                                <p className="text-xs text-[#8b8b8e]">Glissez une image ou cliquez pour importer</p>
                                <p className="text-[10px] text-[#55555a] mt-1">PNG, JPG ou WEBP (Max 5Mo)</p>
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                        </label>
                    </div>
                )}

                {scanning && (
                    <div className="p-4 text-center">
                        <button
                            onClick={stopScanner}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors"
                        >
                            <XCircle size={16} />
                            Arrêter la caméra
                        </button>
                    </div>
                )}

                {loading && (
                    <div className="p-12 text-center">
                        <Loader2 className="animate-spin text-accent mx-auto mb-3" size={24} />
                        <p className="text-sm text-[#8b8b8e]">Traitement en cours...</p>
                    </div>
                )}
            </div>

            {error && (
                <div className="card p-4 mb-4 border-red-500/20">
                    <p className="text-sm text-red-400">{error}</p>
                </div>
            )}

            {/* Not found state */}
            {notFoundSku && (
                <div className="animate-fade-in">
                    <div className="card p-5 text-center">
                        <div className="mb-4">
                            <p className="text-xs text-[#55555a] mb-1">Code inconnu</p>
                            <p className="font-mono text-sm text-accent">{notFoundSku}</p>
                        </div>
                        <p className="text-sm text-[#8b8b8e] mb-6">
                            Ce produit n'existe pas encore dans votre inventaire.
                        </p>
                        <button
                            onClick={() => navigate('/products', { state: { newSku: notFoundSku } })}
                            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-[#0c0c0f] text-sm font-medium hover:bg-accent-hover transition-colors"
                        >
                            <Plus size={16} />
                            Créer ce produit
                        </button>
                        <button
                            onClick={() => {
                                setNotFoundSku(null)
                                startScanner()
                            }}
                            className="w-full mt-3 py-2.5 text-sm text-[#55555a] hover:text-[#8b8b8e] transition-colors"
                        >
                            Réessayer
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
