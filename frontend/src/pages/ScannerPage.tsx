import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import { productsApi } from '../lib/api'
import { ScanBarcode, Camera, XCircle, Plus, Package } from 'lucide-react'

export default function ScannerPage() {
    const navigate = useNavigate()
    const scannerRef = useRef<Html5Qrcode | null>(null)
    const [scanning, setScanning] = useState(false)
    const [result, setResult] = useState<string | null>(null)
    const [product, setProduct] = useState<any>(null)
    const [notFound, setNotFound] = useState(false)
    const [error, setError] = useState('')

    const startScanner = async () => {
        setResult(null)
        setProduct(null)
        setNotFound(false)
        setError('')

        try {
            const scanner = new Html5Qrcode('scanner-region')
            scannerRef.current = scanner

            await scanner.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 280, height: 150 } },
                async (decodedText) => {
                    setResult(decodedText)
                    await scanner.stop()
                    setScanning(false)

                    try {
                        const { data } = await productsApi.getBySku(decodedText)
                        setProduct(data)
                    } catch {
                        setNotFound(true)
                    }
                },
                () => { },
            )
            setScanning(true)
        } catch (err) {
            setError("Impossible d'accéder à la caméra. Vérifiez les permissions.")
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
                <div id="scanner-region" className="w-full min-h-[250px] bg-black/30" />

                {!scanning && !result && (
                    <div className="p-6 text-center">
                        <button
                            onClick={startScanner}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-[#0c0c0f] font-medium text-sm hover:bg-accent-hover transition-colors"
                        >
                            <Camera size={18} />
                            Lancer le scan
                        </button>
                        <p className="text-xs text-[#55555a] mt-3">
                            Scannez un code-barres pour rechercher ou ajouter un produit
                        </p>
                    </div>
                )}

                {scanning && (
                    <div className="p-4 text-center">
                        <button
                            onClick={stopScanner}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors"
                        >
                            <XCircle size={16} />
                            Arrêter
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <div className="card p-4 mb-4 border-red-500/20">
                    <p className="text-sm text-red-400">{error}</p>
                </div>
            )}

            {/* Scan result */}
            {result && (
                <div className="animate-fade-in">
                    <div className="card p-4 mb-4">
                        <p className="text-xs text-[#55555a] mb-1">Code scanné</p>
                        <p className="font-mono text-sm text-accent">{result}</p>
                    </div>

                    {product && (
                        <div className="card p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-surface-light flex items-center justify-center">
                                    <Package size={18} className="text-[#55555a]" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-[#e4e4e7]">{product.name}</h3>
                                    <p className="text-xs text-[#55555a]">Stock : {product.current_stock}</p>
                                </div>
                            </div>
                            <p className="text-sm text-[#8b8b8e]">{product.description || 'Aucune description'}</p>
                        </div>
                    )}

                    {notFound && (
                        <div className="card p-5 text-center">
                            <p className="text-sm text-[#8b8b8e] mb-4">Produit non trouvé pour ce code-barres.</p>
                            <button
                                onClick={() => navigate('/products')}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-[#0c0c0f] text-sm font-medium hover:bg-accent-hover transition-colors"
                            >
                                <Plus size={16} />
                                Créer ce produit
                            </button>
                        </div>
                    )}

                    <button
                        onClick={() => {
                            setResult(null)
                            setProduct(null)
                            setNotFound(false)
                            startScanner()
                        }}
                        className="w-full mt-4 py-2.5 rounded-lg bg-surface border border-surface-border text-sm font-medium text-[#8b8b8e] hover:bg-surface-light transition-colors"
                    >
                        Scanner un autre code
                    </button>
                </div>
            )}
        </div>
    )
}
