import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Check, X } from "lucide-react"

type Offer = {
    id: number
    amount: number
    status: 'pending' | 'accepted' | 'declined'
    createdAt: string
    listingTitle: string
    buyerName: string
}

export function IncomingOffers() {
    const { session } = useAuth()
    const [offers, setOffers] = useState<Offer[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (session?.access_token) {
            fetchOffers()
        }
    }, [session])

    const fetchOffers = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/offers/incoming`, {
                headers: { 'Authorization': `Bearer ${session?.access_token}` }
            })
            const data = await res.json()
            setOffers(data.offers || [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleStatus = async (id: number, status: 'accepted' | 'declined') => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/offers/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ status })
            })
            if (res.ok) {
                fetchOffers() // Refresh list
            }
        } catch (e) {
            console.error(e)
        }
    }

    if (loading) return <div>Loading offers...</div>
    if (offers.length === 0) return null // Don't show if empty

    return (
        <Card className="mb-8 border-blue-200 bg-blue-50/30">
            <CardHeader>
                <CardTitle className="text-xl text-blue-900">Incoming Offers</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {offers.map((offer) => (
                        <div key={offer.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
                            <div>
                                <p className="font-semibold text-lg">{offer.buyerName} offered £{(offer.amount / 100).toFixed(2)}</p>
                                <p className="text-sm text-muted-foreground">for {offer.listingTitle}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {offer.status === 'pending' && (
                                    <>
                                        <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleStatus(offer.id, 'declined')}>
                                            <X className="h-4 w-4 mr-1" /> Decline
                                        </Button>
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleStatus(offer.id, 'accepted')}>
                                            <Check className="h-4 w-4 mr-1" /> Accept
                                        </Button>
                                    </>
                                )}
                                {offer.status !== 'pending' && (
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${offer.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {offer.status.toUpperCase()}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
