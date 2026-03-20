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
                    // Success callback
                    setResult(decodedText)
                    await scanner.stop()
                    setScanning(false)

                    // Lookup by SKU
                    try {
                        const { data } = await productsApi.getBySku(decodedText)
                        setProduct(data)
                    } catch {
                        setNotFound(true)
                    }
                },
                () => {
                    // Ignore scan errors (no code detected)
                },
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
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <ScanBarcode size={24} className="text-brand-400" />
                Scanner
            </h1>

            {/* Scanner viewport */}
            <div className="glass rounded-2xl overflow-hidden mb-6">
                <div id="scanner-region" className="w-full min-h-[250px] bg-gray-900/50" />

                {!scanning && !result && (
                    <div className="p-6 text-center">
                        <button
                            onClick={startScanner}
                            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                        >
                            <Camera size={20} />
                            Lancer le scan
                        </button>
                        <p className="text-xs text-gray-600 mt-3">
                            Scannez un code-barres pour rechercher ou ajouter un produit
                        </p>
                    </div>
                )}

                {scanning && (
                    <div className="p-4 text-center">
                        <button
                            onClick={stopScanner}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors"
                        >
                            <XCircle size={18} />
                            Arrêter
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <div className="glass rounded-xl p-4 mb-4 border-red-500/20">
                    <p className="text-sm text-red-400">{error}</p>
                </div>
            )}

            {/* Scan result */}
            {result && (
                <div className="animate-fade-in">
                    <div className="glass rounded-xl p-4 mb-4">
                        <p className="text-xs text-gray-500 mb-1">Code scanné</p>
                        <p className="font-mono text-sm text-brand-400">{result}</p>
                    </div>

                    {product && (
                        <div className="glass rounded-xl p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-lg bg-brand-600/10 flex items-center justify-center">
                                    <Package size={20} className="text-brand-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">{product.name}</h3>
                                    <p className="text-xs text-gray-500">Stock : {product.current_stock}</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-400">{product.description || 'Aucune description'}</p>
                        </div>
                    )}

                    {notFound && (
                        <div className="glass rounded-xl p-5 text-center">
                            <p className="text-sm text-gray-400 mb-4">Produit non trouvé pour ce code-barres.</p>
                            <button
                                onClick={() => navigate('/products')}
                                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                            >
                                <Plus size={18} />
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
                        className="w-full mt-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-gray-400 hover:bg-white/10 transition-colors"
                    >
                        Scanner un autre code
                    </button>
                </div>
            )}
        </div>
    )
}
